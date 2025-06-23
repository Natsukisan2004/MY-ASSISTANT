let currentDate = new Date(); // 初期表示は現在日付
const userName = localStorage.getItem("userName");
const userUId = localStorage.getItem("userUId"); 
document.getElementById("welcomeMsg").textContent = `ようこそ ${userName} さん`;

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
  const userUId = localStorage.getItem("userUId");
  if (!userUId) {
    console.error("userUId が見つかりません");
    return;
  }

  loadEvents(userUId, (loadedEvents) => {
    events.length = 0;
    events.push(...loadedEvents);
    createCalendar();
  });
});