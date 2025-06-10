let currentDate = new Date(2025, 4, 27); // 初期表示 2025年5月27日
let events = [];

class Event {
  constructor(date, time, location, note, color) {
    this.date = date;
    this.time = time;
    this.location = location;
    this.note = note;
    this.color = color;
  }
}

// Firebase初期化済み前提（firebase-config.jsで）
const db = firebase.firestore();
const userUID = localStorage.getItem("userUID");
const userName = localStorage.getItem("userName");
document.getElementById("welcomeMsg").textContent = `ようこそ ${userName} さん`;

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
  dayDiv.className = `calendar-day ${isOtherMonth ? 'other-month' : ''}`;
  dayDiv.dataset.date = formatDate(date);

  if (formatDate(date) === formatDate(new Date())) {
    dayDiv.classList.add('current-day');
  }

  dayDiv.innerHTML = `
    <div class="day-number">${date.getDate()}</div>
    <div class="events-container"></div>
  `;

  dayDiv.addEventListener('click', () => openEventModal(date));
  calendar.appendChild(dayDiv);
}

function renderEvents() {
  const calendarDays = document.querySelectorAll('.calendar-day');
  calendarDays.forEach(day => {
    const dateStr = day.dataset.date;
    const dayEvents = events.filter(event => event.date === dateStr);
    const eventsContainer = day.querySelector('.events-container');
    eventsContainer.innerHTML = '';

    dayEvents.forEach(event => {
      const eventElement = document.createElement('div');
      eventElement.className = 'event-item';
      eventElement.style.backgroundColor = event.color;
      eventElement.innerHTML = `
        <span>${event.time}</span>
        <span>${event.location}</span>
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
    modal.className = 'event-detail-popup'; // CSS で見せたいならこのクラスにスタイルを用意

    modal.innerHTML = `
        <div class="event-detail-modal">
            <p><strong>日付:</strong> ${event.date}</p>
            <p><strong>時間:</strong> ${event.time}</p>
            <p><strong>場所:</strong> ${event.location}</p>
            <p><strong>メモ:</strong> ${event.note}</p>
            <button id="deleteEventBtn">🗑 削除</button>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('deleteEventBtn').onclick = () => {
        events = events.filter(e => e !== event);
        document.body.removeChild(modal);
        createCalendar();
    };

  // モーダルをクリックして閉じる処理（背景クリック）
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}



document.querySelector('.close').onclick = function () {
    const modal = document.getElementById('eventModal');
    modal.classList.remove('show'); // 中央表示を解除
};  

// 🔸 Firebaseに保存
function saveEvent(date, time, location, note, color) {
  db.collection("users").doc(userUID).collection("events").add({
    date,
    time,
    location,
    note,
    color,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    loadEvents(() => {
      renderEvents();
      createCalendar();
    });
  });
}

// 🔸 Firebaseから取得
function loadEvents(callback) {
  db.collection("users").doc(userUID).collection("events")
    .orderBy("date")
    .get()
    .then(snapshot => {
      events = [];
      snapshot.forEach(doc => events.push({ id: doc.id, ...doc.data() }));
      callback();
    });
}

// フォーム送信処理
document.getElementById('eventForm').onsubmit = function(e) {
    e.preventDefault();

    const newEvent = new Event(
        document.getElementById('eventDate').value,
        document.getElementById('eventTime').value,
        document.getElementById('eventLocation').value,
        document.getElementById('eventNote').value,
        document.querySelector('input[name="eventColor"]:checked').value
    );

    events.push(newEvent);

    const modal = document.getElementById('eventModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);

    renderEvents();
    createCalendar();
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

// 🔸 初期読み込み：Firestoreから取得 → カレンダー生成
loadEvents(() => {
  createCalendar();
});
