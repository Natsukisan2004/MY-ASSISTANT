import { refreshCalendar } from './main.js';
import { showEventDetails } from './eventModal.js';
import { texts } from './lang.js'; // textsオブジェクトをインポート

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

// 現在の言語設定を取得
const currentLang = localStorage.getItem('calendarLang') || 'ja';
const t = texts[currentLang];

// 見出しに言語設定に合わせた年月を表示
let dateText;
if (currentLang === 'ja' || currentLang === 'zh') {
  dateText = `${year}年 ${t.monthNames[month]}`;
} else {
  dateText = `${t.monthNames[month]} ${year}`;
}
document.getElementById('current-date').textContent = dateText;

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

        // 第2引数のコールバックに、ローカル配列を操作する処理の代わりに
        // main.jsからインポートしたrefreshCalendarを直接渡す
        showEventDetails(event, refreshCalendar);
      });

      eventsContainer.appendChild(eventDiv);
    });
  });
}
