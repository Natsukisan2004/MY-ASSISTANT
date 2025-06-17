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

// Firebase初期化済み前提
const db = firebase.firestore();
const userUID = localStorage.getItem("userUID");
const userName = localStorage.getItem("userName");
document.getElementById("welcomeMsg").textContent = `ようこそ ${userName} さん`;

// 日付フォーマット関数
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  document.getElementById("current-date").textContent = `${year}年${month + 1}月`;

  const calendar = document.getElementById("calendar");
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDay = firstDay.getDay();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  calendar.innerHTML = "";

  const weekdayClasses = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  // 前月の日付（グレーアウト）
  for (let i = startingDay - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(year, month - 1, day);
    addDayToCalendar(date, true, weekdayClasses[date.getDay()]);
  }

  // 今月の日付
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day);
    addDayToCalendar(date, false, weekdayClasses[date.getDay()]);
  }

  renderEvents();
}

function addDayToCalendar(date, isOtherMonth, weekdayClass) {
  const calendar = document.getElementById("calendar");
  const dayDiv = document.createElement("div");
  dayDiv.className = `calendar-day ${isOtherMonth ? "other-month" : ""} ${weekdayClass}`;
  dayDiv.dataset.date = formatDate(date);

  if (formatDate(date) === formatDate(new Date())) {
    dayDiv.classList.add("current-day");
  }

  dayDiv.innerHTML = `
    <div class="day-number">${date.getDate()}</div>
    <div class="events-container"></div>
  `;

  dayDiv.addEventListener("click", () => openEventModal(date));
  calendar.appendChild(dayDiv);
}

function renderEvents() {
  const calendarDays = document.querySelectorAll(".calendar-day");
  calendarDays.forEach((day) => {
    const dateStr = day.dataset.date;
    const dayEvents = events.filter((event) => event.date === dateStr);
    const eventsContainer = day.querySelector(".events-container");
    if (!eventsContainer) return;
    eventsContainer.innerHTML = "";

    dayEvents.forEach((event) => {
      const eventElement = document.createElement("div");
      eventElement.className = "event-item";
      eventElement.style.backgroundColor = event.color;
      eventElement.innerHTML = `
        <span>${event.time}</span>
        <span>${event.note}</span>
      `;
      eventElement.addEventListener("click", (e) => {
        e.stopPropagation();
        showEventDetails(event);
      });
      eventsContainer.appendChild(eventElement);
    });
  });
}

function showEventDetails(event) {
  const modal = document.createElement("div");
  modal.className = "event-detail-popup";

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

  document.getElementById("deleteEventBtn").onclick = () => {
    events = events.filter((e) => e !== event);
    document.body.removeChild(modal);
    createCalendar();
  };

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

document.querySelector(".close").onclick = function () {
  const modal = document.getElementById("eventModal");
  modal.classList.remove("show");
};

function saveEvent(date, time, location, note, color) {
  db.collection("users")
    .doc(userUID)
    .collection("events")
    .add({
      date,
      time,
      location,
      note,
      color,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      loadEvents(() => {
        createCalendar();
      });
    });
}

function loadEvents(callback) {
  db.collection("users")
    .doc(userUID)
    .collection("events")
    .orderBy("date")
    .get()
    .then((snapshot) => {
      events = [];
      snapshot.forEach((doc) => events.push({ id: doc.id, ...doc.data() }));
      callback();
    });
}

document.getElementById("eventForm").onsubmit = function (e) {
  e.preventDefault();

  const newEvent = new Event(
    document.getElementById("eventDate").value,
    document.getElementById("eventTime").value,
    document.getElementById("eventLocation").value,
    document.getElementById("eventNote").value,
    document.querySelector('input[name="eventColor"]:checked').value
  );

  events.push(newEvent);

  const modal = document.getElementById("eventModal");
  modal.classList.remove("show");
  setTimeout(() => {
    modal.style.display = "none";
  }, 300);

  renderEvents();
  createCalendar();
};

document.getElementById("prevMonth").onclick = function () {
  currentDate.setMonth(currentDate.getMonth() - 1);
  createCalendar();
};

document.getElementById("nextMonth").onclick = function () {
  currentDate.setMonth(currentDate.getMonth() + 1);
  createCalendar();
};

function openEventModal(date) {
  const modal = document.getElementById("eventModal");
  document.getElementById("eventDate").value = formatDate(date);
  modal.classList.add("show");
}

// 初期読み込み
loadEvents(() => {
  createCalendar();
});

// チャットウィンドウ操作などの追加機能はここに継続可能
