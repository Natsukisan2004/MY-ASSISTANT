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
      eventDiv.textContent = event.eventName;
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


/**
 * ヘッダーの日付表示を、現在のビューに応じて更新する
 * @param {string} view - 'month', 'week', 'day'
 */
export function updateDateHeader(view) {
  const current = getCurrentDate();
  const year = current.getFullYear();
  const month = current.getMonth();
  const day = current.getDate();
  const t = texts[localStorage.getItem('calendarLang') || 'ja'];

  let dateText = '';
  if (view === 'month') {
    dateText = `${year}年 ${t.monthNames[month]}`;
  } else if (view === 'week') {
    const startOfWeek = new Date(current);
    startOfWeek.setDate(day - current.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    dateText = `${startOfWeek.getFullYear()}年${startOfWeek.getMonth() + 1}月${startOfWeek.getDate()}日 - ${endOfWeek.getMonth() + 1}月${endOfWeek.getDate()}日`;
  } else { // day view
    dateText = `${year}年 ${t.monthNames[month]} ${day}日`;
  }
  document.getElementById('current-date').textContent = dateText;
}

/**
 * 週表示ビューを生成する（時間軸付き）（ヘッダー固定版）
 */
export function createWeekView() {
  const view = document.getElementById('week-view');
  view.innerHTML = ''; // 既存の内容をクリア
  const current = getCurrentDate();
  
  const startOfWeek = new Date(current);
  startOfWeek.setDate(current.getDate() - current.getDay());

  // --- ヘッダー行の生成 ---
  const topLeft = document.createElement('div');
  topLeft.className = 'week-top-left';
  view.appendChild(topLeft);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const headerCell = document.createElement('div');
    headerCell.className = 'week-header-cell';
    headerCell.textContent = `${date.getMonth() + 1}/${date.getDate()}`;
    view.appendChild(headerCell);
  }

  // --- 本体行の生成 ---
  const timeAxis = document.createElement('div');
  timeAxis.className = 'week-time-axis';
  for (let hour = 0; hour < 24; hour++) {
    const label = document.createElement('div');
    label.className = 'time-label';
    label.textContent = `${hour}:00`;
    label.style.top = `${hour * 60}px`;
    timeAxis.appendChild(label);
  }
  view.appendChild(timeAxis);

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    
    const dayBody = document.createElement('div');
    dayBody.className = 'week-day-body';

    for (let hour = 0; hour < 24; hour++) {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.style.top = `${hour * 60}px`;
        dayBody.appendChild(slot);
    }
    
    const eventsOnThisDay = getEvents().filter(ev => formatDate(new Date(ev.startDate)) === formatDate(date));
    eventsOnThisDay.forEach(event => {
      if (!event.startTime || !event.endTime) return;

      const eventDiv = document.createElement('div');
      eventDiv.className = 'day-event';
      
      const [startHour, startMinute] = event.startTime.split(':').map(Number);
      const [endHour, endMinute] = event.endTime.split(':').map(Number);

      const top = (startHour * 60) + startMinute;
      let height = ((endHour * 60) + endMinute) - top;
      if (height < 20) height = 20;

      eventDiv.style.top = `${top}px`;
      eventDiv.style.height = `${height}px`;
      eventDiv.textContent = event.eventName;
      eventDiv.style.backgroundColor = event.color;
      
      dayBody.appendChild(eventDiv);
    });
    
    view.appendChild(dayBody);
  }
}

/**
 * 日表示（アジェンダ形式）ビューを生成する
 */
export function createDayView() {
  const view = document.getElementById('day-view');
  view.innerHTML = '';

  // --- 左側の時刻軸 ---
  const timeAxis = document.createElement('div');
  timeAxis.className = 'day-time-axis'; // 新しいクラス名
  for (let hour = 0; hour < 24; hour++) {
    const label = document.createElement('div');
    label.className = 'time-label';
    label.textContent = `${hour}:00`;
    label.style.top = `${hour * 60}px`;
    timeAxis.appendChild(label);
  }
  view.appendChild(timeAxis);

  // --- イベント表示エリア ---
  const dayBody = document.createElement('div');
  dayBody.className = 'day-events-body'; // 新しいクラス名

  // 時間区切りの横線
  for (let hour = 0; hour < 24; hour++) {
    const slot = document.createElement('div');
    slot.className = 'time-slot';
    slot.style.top = `${hour * 60}px`;
    dayBody.appendChild(slot);
  }

  // イベント配置
  const todayEvents = getEvents().filter(ev => formatDate(new Date(ev.startDate)) === formatDate(getCurrentDate()));
  todayEvents.forEach(event => {
    if (!event.startTime || !event.endTime) return;
    const eventDiv = document.createElement('div');
    eventDiv.className = 'day-event';
    const [startHour, startMinute] = event.startTime.split(':').map(Number);
    const [endHour, endMinute] = event.endTime.split(':').map(Number);
    const top = (startHour * 60) + startMinute;
    let height = ((endHour * 60) + endMinute) - top;
    if (height < 20) height = 20;
    eventDiv.style.top = `${top}px`;
    eventDiv.style.height = `${height}px`;
    eventDiv.textContent = event.eventName;
    eventDiv.style.backgroundColor = event.color;
    dayBody.appendChild(eventDiv);
  });
  view.appendChild(dayBody);
}
