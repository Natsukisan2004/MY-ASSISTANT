let currentDate = new Date(); // 初期表示は現在日付
const userName = localStorage.getItem("userName");
const userUId = localStorage.getItem("userUId"); 

class Event {
  constructor(startDate, endDate, time, location, note, color) {
    this.startDate = startDate;
    this.endDate = endDate;
    this.time = time;
    this.location = location;
    this.note = note;
    this.color = color;
  }
}

const events = []; // イベント配列を初期化

// 日付フォーマット関数
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// カレンダー作成
function createCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  document.getElementById('current-date').textContent = `${year}年${month + 1}月`;

  const calendar = document.getElementById('calendar');
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDay = firstDay.getDay();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  calendar.innerHTML = '';

  for (let i = startingDay - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(year, month - 1, day);
    addDayToCalendar(date, true);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    addDayToCalendar(date, false);
  }

  renderEvents();
}

function addDayToCalendar(date, isOtherMonth) {
  const calendar = document.getElementById('calendar');
  const dayDiv = document.createElement('div');
  const dayOfWeekClass = [
    "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"
  ];
  const dow = date.getDay(); // 0:日, 1:月, ...
  dayDiv.className = `calendar-day ${dayOfWeekClass[dow]} ${isOtherMonth ? 'other-month' : ''}`;
  dayDiv.dataset.date = formatDate(date);

  // 判斷今天（根據用戶時區）
  const now = new Date();
  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate() &&
    !isOtherMonth
  ) {
    dayDiv.innerHTML = `
      <div class="day-number today-circle">${date.getDate()}</div>
      <div class="events-container"></div>
    `;
  } else {
    dayDiv.innerHTML = `
      <div class="day-number">${date.getDate()}</div>
      <div class="events-container"></div>
    `;
  }

  dayDiv.addEventListener('click', () => openEventModal(date));
  calendar.appendChild(dayDiv);
}

function renderEvents() {
  const calendarDays = document.querySelectorAll('.calendar-day');
  calendarDays.forEach(day => {
    const dateStr = day.dataset.date;
    const eventsContainer = day.querySelector('.events-container');
    eventsContainer.innerHTML = '';

    const dayEvents = events.filter(event => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate || event.startDate);
      const current = new Date(dateStr);
      return current >= start && current <= end;
    });

    dayEvents.forEach(event => {
      const eventElement = document.createElement('div');
      eventElement.className = 'event-item';
      eventElement.style.backgroundColor = event.color;
      eventElement.innerHTML = `
        <span>${event.time}</span>
        <span>${event.note}</span>
      `;
      eventElement.addEventListener('click', (e) => {
        e.stopPropagation();
        showEventDetails(event);
      });
      eventsContainer.appendChild(eventElement);
    });
  });
}

function showEventDetails(event) {
  const modal = document.createElement('div');
  modal.className = 'event-detail-popup';
  modal.innerHTML = `
    <div class="event-detail-modal">
      <p><strong>開始日:</strong> ${event.startDate}</p>
      <p><strong>終了日:</strong> ${event.endDate || event.startDate}</p>
      <p><strong>時間:</strong> ${event.time}</p>
      <p><strong>場所:</strong> ${event.location}</p>
      <p><strong>メモ:</strong> ${event.note}</p>
      <button id="deleteEventBtn">🗑 削除</button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('deleteEventBtn').onclick = () => {
    deleteEvent(event);
    document.body.removeChild(modal);
    createCalendar();
  };

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

function showEventConfirm(eventObj) {
  const modal = document.createElement('div');
  modal.className = 'event-detail-popup';
  modal.innerHTML = `
    <div class="event-detail-modal">
      <h3>このイベントを追加しますか？</h3>
      <p><strong>開始日:</strong> ${eventObj.startDate}</p>
      <p><strong>終了日:</strong> ${eventObj.endDate || eventObj.startDate}</p>
      <p><strong>時間:</strong> ${eventObj.time}</p>
      <p><strong>場所:</strong> ${eventObj.location}</p>
      <p><strong>メモ:</strong> ${eventObj.note}</p>
      <button id="confirmAddEventBtn">追加</button>
      <button id="cancelAddEventBtn">キャンセル</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('confirmAddEventBtn').onclick = () => {
    const newEvent = new Event(
      eventObj.startDate,
      eventObj.endDate,
      eventObj.time,
      eventObj.location,
      eventObj.note,
      "#1a73e8"
    );
    events.push(newEvent);
    saveEvent(userUId, newEvent);
    createCalendar();
    document.body.removeChild(modal);
    alert("イベントを追加しました！");
  };
  document.getElementById('cancelAddEventBtn').onclick = () => {
    document.body.removeChild(modal);
  };
  modal.addEventListener('click', (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  });
}

function saveEvent(userUId, event) {
  const db = firebase.firestore();
  db.collection("users")
    .doc(userUId)
    .collection("events")
    .add(JSON.parse(JSON.stringify(event)))
    .then(() => {
      console.log("イベント保存成功");
    })
    .catch((error) => {
      console.error("イベント保存失敗:", error);
    });
}

function loadEvents(userUId, callback) {
  const db = firebase.firestore();
  db.collection("users")
    .doc(userUId)
    .collection("events")
    .get()
    .then((querySnapshot) => {
      const loadedEvents = [];
      querySnapshot.forEach((doc) => {
        loadedEvents.push(doc.data());
      });
      callback(loadedEvents);
    })
    .catch((error) => {
      console.error("イベント読み込み失敗:", error);
    });
}

// フォーム送信処理
document.getElementById('eventForm').onsubmit = function(e) {
  e.preventDefault();
  const newEvent = new Event(
    document.getElementById('eventDate').value,
    document.getElementById('eventEndDate').value,
    document.getElementById('eventTime').value,
    document.getElementById('eventLocation').value,
    document.getElementById('eventNote').value,
    document.querySelector('input[name="eventColor"]:checked').value
  );
  events.push(newEvent);
  saveEvent(userUId, newEvent);
  createCalendar();
  document.getElementById('eventModal').classList.remove('show');
};

// 月切替処理
document.getElementById('prevMonth').onclick = function () {
  currentDate.setMonth(currentDate.getMonth() - 1);
  createCalendar();
};
document.getElementById('nextMonth').onclick = function () {
  currentDate.setMonth(currentDate.getMonth() + 1);
  createCalendar();
};

// イベントモーダル開く
function openEventModal(date) {
  const modal = document.getElementById('eventModal');
  document.getElementById('eventDate').value = formatDate(date);
  modal.classList.add('show');
}

// 初期読み込み
document.addEventListener("DOMContentLoaded", () => {
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const userUId = user.uid;
      const userName = user.displayName;
      document.getElementById("welcomeMsg").textContent = `ようこそ ${userName} さん`;

      loadEvents(userUId, (loadedEvents) => {
        events.length = 0;
        events.push(...loadedEvents);
        createCalendar();
      });
    } else {
      console.error("ユーザーがログインしていません");
      window.location.href = "login.html"; // ログインページに戻す
    }
  });

  // チャットウィンドウの表示/非表示切り替え
  const chatToggle = document.getElementById('chatToggle');
  const chatWindow = document.getElementById('chatWindow');
  if (chatToggle && chatWindow) {
    chatToggle.addEventListener('click', () => {
      chatWindow.classList.toggle('hidden');
    });
  }

  // 音声入力
  const micBtn = document.getElementById('micBtn');
  let recognition;
  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = false;

    micBtn.addEventListener('click', () => {
      recognition.start();
      micBtn.disabled = true;
      micBtn.textContent = '🎤...';
    });

    recognition.onresult = function(event) {
      const transcript = event.results[0][0].transcript;
      document.getElementById('userInput').value = transcript; // 只填充，不自動發送
    };
    recognition.onend = function() {
      micBtn.disabled = false;
      micBtn.textContent = '🎤';
    };
    recognition.onerror = function() {
      micBtn.disabled = false;
      micBtn.textContent = '🎤';
    };
  } else {
    micBtn.disabled = true;
    micBtn.title = "このブラウザは音声認識に対応していません";
  }

  // API設定ウィンドウ
  const apiSettingModal = document.getElementById('apiSettingModal');
  const openApiSetting = document.getElementById('openApiSetting');
  const closeApiSetting = document.getElementById('closeApiSetting');
  const apiSettingForm = document.getElementById('apiSettingForm');
  const apiUrlInput = document.getElementById('apiUrlInput');
  const apiKeyInput = document.getElementById('apiKeyInput');

  // 打開設定
  openApiSetting.onclick = () => {
    apiUrlInput.value = localStorage.getItem('openai_api_url') || 'https://api.openai.com/v1/chat/completions';
    apiKeyInput.value = localStorage.getItem('openai_api_key') || '';
    apiSettingModal.classList.add('show');
  };
  // 關閉設定
  closeApiSetting.onclick = () => apiSettingModal.classList.remove('show');
  apiSettingModal.onclick = (e) => { if (e.target === apiSettingModal) apiSettingModal.classList.remove('show'); };

  // 保存設定
  apiSettingForm.onsubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('openai_api_url', apiUrlInput.value);
    localStorage.setItem('openai_api_key', apiKeyInput.value);
    alert('API設定を保存しました');
    apiSettingModal.classList.remove('show');
  };

  // チャット送信＆AI事件生成
  const chatForm = document.getElementById('chatForm');
  const userInput = document.getElementById('userInput');
  const chatMessages = document.getElementById('chatMessages');

  if (chatForm && userInput && chatMessages) {
    chatForm.onsubmit = function(e) {
      e.preventDefault();
      const text = userInput.value.trim();
      if (!text) return;

      // 顯示用戶訊息
      const userMsg = document.createElement('div');
      userMsg.textContent = "👤 " + text;
      chatMessages.appendChild(userMsg);

      // 發送給AI
      const apiUrl = localStorage.getItem('openai_api_url') || 'https://api.openai.com/v1/chat/completions';
      const apiKey = localStorage.getItem('openai_api_key') || '';
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: '今日は${todayStr}です。ユーザーが話した内容からカレンダーイベントを抽出し、JSONで返してください。例: {"startDate":"2025-06-25","endDate":"2025-06-25","time":"14:00","location":"渋谷","note":"打ち合わせ"}'
            },
            {
              role: 'user',
              content: text
            }
          ]
        })
      })
      .then(res => res.json())
      .then(data => {
        const content = data.choices[0].message.content;
        let eventObj;
        try {
          eventObj = JSON.parse(content);
        } catch {
          alert("AIの返答を解析できません: " + content);
          return;
        }
        // 顯示事件確認視窗
        showEventConfirm(eventObj);
      })
      .catch(err => {
        alert("AIエラー: " + err.message);
      });

      userInput.value = '';
    };
  }
});

