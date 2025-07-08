import { initAuth, onAuthReady } from './auth.js';
import { loadEvents, saveEvent, updateEvent } from './eventStorage.js'; // updateEvent を追加
import {
  createCalendar,
  setCurrentDate,
  getCurrentDate,
  setEvents,
  getEvents
} from './calendar.js';
import {
  openEventModal,
  openEventModalForEdit,
  showEventDetails,
  showEventConfirm
} from './eventModal.js';
import { initChatAssistant } from './chatAssistant.js';

// 【追加】Firebaseから最新イベントを取得しカレンダーを再描画する関数
export async function refreshCalendar() {
  const userUId = localStorage.getItem("userUId");
  if (!userUId) return;

  try {
    const loadedEvents = await loadEvents(userUId);
    setEvents(loadedEvents);
    createCalendar();
  } catch (error) {
    console.error('❌ カレンダーの更新に失敗しました', error);
  }
}

// 月の切り替え
document.getElementById('prevMonth').onclick = () => {
  const current = getCurrentDate();
  current.setMonth(current.getMonth() - 1);
  setCurrentDate(current);
  createCalendar();
};

document.getElementById('nextMonth').onclick = () => {
  const current = getCurrentDate();
  current.setMonth(current.getMonth() + 1);
  setCurrentDate(current);
  createCalendar();
};

// モーダル関数をグローバル化（calendar.jsなど他からも使えるように）
window.openEventModal = openEventModal;
window.openEventModalForEdit = openEventModalForEdit;

// イベント追加・編集フォーム処理
const eventForm = document.getElementById('eventForm');
eventForm.onsubmit = async function (e) {
  e.preventDefault();
  const userUId = localStorage.getItem("userUId");
  if (!userUId) {
    alert("ログインしてください");
    return;
  }

  const formData = new FormData(eventForm);
  const eventDate = {
    startDate: formData.get('eventDate'),
    endDate: formData.get('eventEndDate'),
    time: formData.get('eventTime'),
    location: formData.get('eventLocation'),
    note: formData.get('eventNote'),
    color: formData.get('eventColor'),
  };

  const modal = document.getElementById('eventModal');
  const editingId = modal.dataset.editingId;

  try {
    if (editingId) {
      // 編集時：直接Firestoreを更新
      eventDate._id = editingId;
      await updateEvent(userUId, editingId, eventDate);
    } else {
      // 新規作成時：直接Firestoreに追加
      await saveEvent(userUId, eventDate);
    }
    
    // ★ 処理成功後にローカル配列を直接いじらず、refreshCalendarを呼ぶ
    await refreshCalendar();

    modal.classList.remove('show');
    eventForm.reset();
    modal.dataset.editingId = '';
  } catch (error) {
    alert('イベントの保存に失敗しました');
    console.error(error);
  }
};

// ページロード後の初期化
document.addEventListener('DOMContentLoaded', async () => {
  initAuth();

  onAuthReady(async (userUId, userName) => {
    document.getElementById("welcomeMsg").textContent = `ようこそ ${userName} さん`;

    try {
      const loadedEvents = await loadEvents(userUId);
      setEvents(loadedEvents);
      createCalendar();
    } catch (error) {
      console.error('❌ イベント読み込みに失敗しました', error);
    }
  });

  // チャットアシスタント初期化
  initChatAssistant({
    micBtnId: 'micBtn',
    inputId: 'userInput',
    chatFormId: 'chatForm',
    messagesId: 'chatMessages'
  });

  // チャットAIからの確認イベント処理
  window.onChatConfirmed = async (confirmedEvent) => {
    const userUId = localStorage.getItem("userUId");
    if (!userUId) {
      alert("ログインしてください");
      return;
    }

    try {
      const events = getEvents();
      events.push(confirmedEvent);
      await saveEvent(userUId, confirmedEvent);
      createCalendar();
      console.log('✅ AIからの予定が保存されました:', confirmedEvent);
    } catch (error) {
      console.error('❌ AIイベント保存失敗:', error);
      alert('予定の保存に失敗しました');
    }
  };

  // ===== ここから追加：チャットウィンドウの開閉 =====
  const chatToggleBtn = document.getElementById('chatToggle');
  const chatWindow = document.getElementById('chatWindow');
  if (chatToggleBtn && chatWindow) {
    chatToggleBtn.addEventListener('click', () => {
      chatWindow.classList.toggle('hidden');
    });
  }

  // ===== ここから追加：OpenAI API 設定モーダル =====
  const openApiSettingBtn = document.getElementById('openApiSetting');
  const apiSettingModal = document.getElementById('apiSettingModal');
  const closeApiSettingBtn = document.getElementById('closeApiSetting');
  const apiSettingForm = document.getElementById('apiSettingForm');
  const apiUrlInput = document.getElementById('apiUrlInput');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const modelInput = document.getElementById('modelInput');

  if (openApiSettingBtn && apiSettingModal) {
    // ボタンでモーダル表示
    openApiSettingBtn.addEventListener('click', () => {
      // 既存設定をフォームに反映
      apiUrlInput.value = localStorage.getItem('openai_api_url') || 'https://openrouter.ai/api/v1/chat/completions';
      apiKeyInput.value = localStorage.getItem('openai_api_key') || '';
      modelInput.value = localStorage.getItem('openai_model') || 'deepseek/deepseek-r1-0528:free';
      apiSettingModal.classList.add('show');
    });
  }

  if (closeApiSettingBtn && apiSettingModal) {
    closeApiSettingBtn.addEventListener('click', () => {
      apiSettingModal.classList.remove('show');
    });
  }

  // モーダルの外側クリックで閉じる
  if (apiSettingModal) {
    apiSettingModal.addEventListener('click', (e) => {
      if (e.target === apiSettingModal) {
        apiSettingModal.classList.remove('show');
      }
    });
  }

  // フォーム送信で設定を保存
  if (apiSettingForm) {
    apiSettingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      localStorage.setItem('openai_api_url', apiUrlInput.value.trim());
      localStorage.setItem('openai_api_key', apiKeyInput.value.trim());
      localStorage.setItem('openai_model', modelInput.value.trim());
      apiSettingModal.classList.remove('show');
      alert('API設定を保存しました');
    });
  }
  // ===== 追加ここまで =====

  // モーダルを閉じる処理
  const modal = document.getElementById('eventModal');
  modal.querySelector('.close').addEventListener('click', () => {
    modal.classList.remove('show');
    modal.dataset.editingId = ''; // 編集状態解除
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      modal.dataset.editingId = '';
    }
  });
});
