import { showEventDetails } from './eventModal.js';

let currentDate = new Date();
let events = [];

/** 現在表示している年月日を返す */
export function getCurrentDate() {
  return currentDate;
}

/** 現在表示年月日を設定 */
export function setCurrentDate(date) {
  currentDate = date;
}

/** 外部からイベント配列をセット */
export function setEvents(loadedEvents) {
  events = loadedEvents;
}

/** イベント配列を返す */
export function getEvents() {
  return events;
}

/** 日付を "YYYY-MM-DD" の文字列に変換 */
export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** カレンダーのHTMLを生成して画面に反映 */
export function createCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';

  // 見出しに年月表示
  document.getElementById('current-date').textContent = `${year}年${month + 1}月`;

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDayOfMonth.getDay();
  const lastDatePrevMonth = new Date(year, month, 0).getDate();

  // 前月の残り日を表示（日曜始まりのため調整）
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, lastDatePrevMonth - i);
    appendDayToCalendar(date, true);
  }

  // 今月の日を表示
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const date = new Date(year, month, day);
    appendDayToCalendar(date, false);
  }

  // イベントを表示
  renderEvents();
}

/** 指定した日付のセルをカレンダーに追加 */
function appendDayToCalendar(date, isOtherMonth) {
  const calendar = document.getElementById('calendar');
  const dayDiv = document.createElement('div');

  const weekdayClass = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayOfWeek = date.getDay();

  dayDiv.className = `calendar-day ${weekdayClass[dayOfWeek]} ${isOtherMonth ? 'other-month' : ''}`;
  dayDiv.dataset.date = formatDate(date);

  const now = new Date();
  const isToday = formatDate(date) === formatDate(now) && !isOtherMonth;

  dayDiv.innerHTML = `
    <div class="day-number ${isToday ? 'today-circle' : ''}">${date.getDate()}</div>
    <div class="events-container"></div>
  `;

  dayDiv.addEventListener('click', () => {
    if (typeof window.openEventModal === 'function') {
      window.openEventModal(date);
    }
  });

  calendar.appendChild(dayDiv);
}

/** カレンダー上の各日にイベントを表示 */
function renderEvents() {
  const dayElems = document.querySelectorAll('.calendar-day');

  dayElems.forEach(dayElem => {
    const dateStr = dayElem.dataset.date;
    const eventsContainer = dayElem.querySelector('.events-container');
    eventsContainer.innerHTML = '';

    // 日付文字列を比較することで時刻差の影響を防ぐ
    const eventsOnThisDay = events.filter(ev => {
      const start = formatDate(new Date(ev.startDate));
      const end = formatDate(new Date(ev.endDate || ev.startDate));
      return dateStr >= start && dateStr <= end;
    });

    eventsOnThisDay.forEach(event => {
      const eventDiv = document.createElement('div');
      eventDiv.className = 'event-item';
      eventDiv.style.backgroundColor = event.color || '#1a73e8';
      eventDiv.innerHTML = `<span>${event.time}</span><span>${event.note}</span>`;

      eventDiv.addEventListener('click', (e) => {
        e.stopPropagation();

        showEventDetails(event, () => {
          const idx = events.findIndex(ev => ev._id === event._id);
          if (idx !== -1) {
            events.splice(idx, 1);
            // Firestoreからの削除などの処理はここに追加可能
            createCalendar();
          }
        });
      });

      eventsContainer.appendChild(eventDiv);
    });
  });
}
