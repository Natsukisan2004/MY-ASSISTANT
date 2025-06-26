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
  const newEvent = {
    startDate: formData.get('eventDate'),
    endDate: formData.get('eventEndDate'),
    time: formData.get('eventTime'),
    location: formData.get('eventLocation'),
    note: formData.get('eventNote'),
    color: formData.get('eventColor'),
  };

  const modal = document.getElementById('eventModal');
  const editingId = modal.dataset.editingId;
  const events = getEvents();

  try {
    if (editingId) {
      // 編集時
      newEvent._id = editingId;
      const index = events.findIndex(e => e._id === editingId);
      if (index !== -1) {
        events[index] = newEvent;
        await updateEvent(userUId, editingId, newEvent); // Firestore更新
      }
    } else {
      // 新規作成時
      events.push(newEvent);
      await saveEvent(userUId, newEvent); // Firestore追加
    }

    createCalendar();
    modal.classList.remove('show');
    eventForm.reset();
    modal.dataset.editingId = ''; // 編集状態解除
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
