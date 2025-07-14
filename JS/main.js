import { initAuth, onAuthReady } from './auth.js';
import { loadEvents, saveEvent, updateEvent } from './eventStorage.js'; // updateEvent を追加
import {
  createCalendar,
  createWeekView, 
  createDayView,
  setCurrentDate,
  getCurrentDate,
  setEvents,
  getEvents,
  updateDateHeader
} from './calendar.js';
import {
  openEventModal,
  openEventModalForEdit,
  showEventDetails,
  showEventConfirm
} from './eventModal.js';
import { initChatAssistant } from './chatAssistant.js';
import { applyLang } from './lang.js';

let currentView = 'month';

// 【追加】Firebaseから最新イベントを取得しカレンダーを再描画する関数
export async function refreshCalendar() {
  const userUId = localStorage.getItem("userUId");
  if (!userUId) return;

  try {
    const loadedEvents = await loadEvents(userUId);
    setEvents(loadedEvents);
    renderCurrentView();
  } catch (error) {
    console.error('❌ カレンダーの更新に失敗しました', error);
  }
}

/**
 * 現在のビューに応じて、対応する描画関数を呼び出す
 */
function renderCurrentView() {
  updateDateHeader(currentView);
  if (currentView === 'month') createCalendar();
  else if (currentView === 'week') createWeekView();
  else createDayView();
}

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
    eventName: formData.get('eventName'),
    startDate: formData.get('eventDate'),
    endDate: formData.get('eventEndDate'),
    startTime: formData.get('eventStartTime'), 
    endTime: formData.get('eventEndTime'),   
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
      // 新規作成時：直接Firestoreに追加（新規作成時：直接Firestoreに追加）
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
  // 各ビューのHTML要素をオブジェクトとして保持
  const views = {
    month: document.getElementById('calendar'),
    week: document.getElementById('week-view'),
    day: document.getElementById('day-view')
  };

  /**
   * 表示を切り替える関数
   */
function switchView(view) {
  currentView = view;
  for (const key in views) {
    views[key].classList.toggle('hidden', key !== view);
  }
  viewButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === view);
  });

  // ▼▼▼【ここから追加】表示モードに応じてクラスを付け外し ▼▼▼
  const container = document.querySelector('.calendar-container');
  if (view === 'month') {
    // 月表示のときは、高さ固定クラスを削除
    container.classList.remove('fixed-height-view');
  } else {
    // 日・週表示のときは、高さ固定クラスを追加
    container.classList.add('fixed-height-view');
  }
    renderCurrentView();
  }

  // --- イベントリスナー設定 ---
  const viewButtons = document.querySelectorAll('.view-btn');
  viewButtons.forEach(button => {
    button.addEventListener('click', () => switchView(button.dataset.view));
  });

  document.getElementById('prevBtn').onclick = () => {
    const current = getCurrentDate();
    if (currentView === 'month') current.setMonth(current.getMonth() - 1);
    else if (currentView === 'week') current.setDate(current.getDate() - 7);
    else current.setDate(current.getDate() - 1);
    setCurrentDate(current);
    renderCurrentView();
  };

  document.getElementById('nextBtn').onclick = () => {
    const current = getCurrentDate();
    if (currentView === 'month') current.setMonth(current.getMonth() + 1);
    else if (currentView === 'week') current.setDate(current.getDate() + 7);
    else current.setDate(current.getDate() + 1);
    setCurrentDate(current);
    renderCurrentView();
  };

  document.getElementById('todayBtn').onclick = () => {
    setCurrentDate(new Date());
    renderCurrentView();
  };

const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const searchResultsModal = document.getElementById('searchResultsModal');
  const searchResultsContainer = document.getElementById('searchResultsContainer');
  const searchModalCloseBtn = searchResultsModal.querySelector('.close');

  /**
   * キーワードでイベントを検索し、結果を表示する
   */
  function performSearch() {
      const keyword = searchInput.value.trim().toLowerCase();
      if (!keyword) {
          alert('検索キーワードを入力してください。');
          return;
      }

      const allEvents = getEvents();
      const results = allEvents.filter(event => {
          const name = (event.eventName || '').toLowerCase();
          const location = (event.location || '').toLowerCase();
          const note = (event.note || '').toLowerCase();
          return name.includes(keyword) || location.includes(keyword) || note.includes(keyword);
      });

      displaySearchResults(results);
  }

  /**
   * 検索結果をモーダルに表示する
   */
  function displaySearchResults(results) {
      searchResultsContainer.innerHTML = ''; // 結果をクリア

      if (results.length === 0) {
          searchResultsContainer.innerHTML = '<p>該当する予定は見つかりませんでした。</p>';
      } else {
          // 日付の昇順に並び替え
          results.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
          
          results.forEach(event => {
              const item = document.createElement('div');
              item.className = 'search-result-item';
              item.innerHTML = `
                  <div class="search-result-title">${event.eventName}</div>
                  <div class="search-result-date">${event.startDate}</div>
              `;
              // 結果をクリックしたら、その予定の日付に移動
              item.addEventListener('click', () => {
                  setCurrentDate(new Date(event.startDate));
                  renderCurrentView(); // カレンダーを再描画
                  searchResultsModal.classList.remove('show'); // モーダルを閉じる
              });
              searchResultsContainer.appendChild(item);
          });
      }

      searchResultsModal.classList.add('show'); // モーダルを表示
  }

  // 検索ボタンのクリックイベント
  searchBtn.addEventListener('click', performSearch);

  // Enterキーでも検索を実行
  searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
          performSearch();
      }
  });

  // 検索モーダルのクローズ処理
  searchModalCloseBtn.addEventListener('click', () => {
      searchResultsModal.classList.remove('show');
  });
  searchResultsModal.addEventListener('click', (e) => {
      if (e.target === searchResultsModal) {
          searchResultsModal.classList.remove('show');
      }
  });

  // --- 初期化処理 ---
  initAuth();
  onAuthReady(async (userUId, userName) => {
   const savedLang = localStorage.getItem('calendarLang') || 'ja';
  applyLang(savedLang, userName); // 正しい言語設定を適用
    try {
      const loadedEvents = await loadEvents(userUId);
      setEvents(loadedEvents);
      renderCurrentView(); // 最初の描画
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
      await refreshCalendar();
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
  const ocrApiKeyInput = document.getElementById('ocrApiKeyInput');
  const aiLanguageSelect = document.getElementById('aiLanguageSelect');

  if (openApiSettingBtn && apiSettingModal) {
    // ボタンでモーダル表示
    openApiSettingBtn.addEventListener('click', () => {
      // 既存設定をフォームに反映
      apiUrlInput.value = localStorage.getItem('openai_api_url') || 'https://openrouter.ai/api/v1/chat/completions';
      apiKeyInput.value = localStorage.getItem('openai_api_key') || '';
      modelInput.value = localStorage.getItem('openai_model') || 'deepseek/deepseek-r1-0528:free';
      ocrApiKeyInput.value = localStorage.getItem('ocr_api_key') || '';
      
      // 设置语言选择（如果没有设置，使用当前界面语言）（言語選択を設定（未設定の場合は現在のUI言語を使用））
      const currentLang = localStorage.getItem('calendarLang') || 'ja';
      if (aiLanguageSelect) {
        aiLanguageSelect.value = currentLang;
      }
      
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
      
      // OCR API Key保存（空でも保存）
      localStorage.setItem('ocr_api_key', ocrApiKeyInput.value.trim());
      
      // 保存语言设置，同时更新界面语言（言語設定を保存すると同時に、UIの言語も更新）
      if (aiLanguageSelect) {
        const selectedLang = aiLanguageSelect.value;
        localStorage.setItem('calendarLang', selectedLang);
        
        // 立即应用语言设置（言語設定を即時適用）
        import('./lang.js').then(({ applyLang }) => {
          const userName = localStorage.getItem('userName') || '';
          applyLang(selectedLang, userName);
          
          // 更新聊天界面的语言（チャットUIの言語を更新）
          if (window.updateChatLanguage) {
            window.updateChatLanguage();
          }
        });
      }
      
      apiSettingModal.classList.remove('show');
      
      // 根据选择的语言显示不同的成功消息（選択した言語に応じて異なる成功メッセージを表示）
      const langMessages = {
        ja: '🎉 AI & OCR API設定が保存されました！\n\n💡 ヒント：\n- 画像認識機能が有効です\n- ドラッグ＆ドロップまたはクリックで画像をアップロード\n- 自動的にテキストを認識して予定を作成します',
        en: '🎉 AI & OCR API settings saved!\n\n💡 Tips:\n- Image recognition is now active\n- Drag & drop or click to upload images\n- System will auto-recognize text and create events',
        zh: '🎉 AI & OCR API设置已保存！\n\n💡 提示：\n- 图片识别功能已激活\n- 可通过拖拽或点击上传图片\n- 系统将自动识别文字并创建日程'
      };
      
      const currentLang = localStorage.getItem('calendarLang') || 'ja';
      alert(langMessages[currentLang] || langMessages.ja);
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
