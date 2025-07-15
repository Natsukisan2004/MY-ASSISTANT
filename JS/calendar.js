import { updateEvent } from './eventStorage.js';
import { refreshCalendar } from './main.js';
import { showEventDetails } from './eventModal.js';
import { texts } from './lang.js';

let currentDate = new Date();
let events = [];
let dragContext = null;

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
  console.log('【setEvents】设置事件:', loadedEvents);
  events = loadedEvents;
}

/** イベント配列を返す */
export function getEvents() {
  console.log('【getEvents】返回事件:', events);
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
  document.querySelector('.weekdays').style.display = 'grid';
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendar = document.getElementById('calendar');
  calendar.innerHTML = '';

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDayOfMonth.getDay();
  const lastDatePrevMonth = new Date(year, month, 0).getDate();

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, lastDatePrevMonth - i);
    appendDayToCalendar(date, true);
  }

  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    const date = new Date(year, month, day);
    appendDayToCalendar(date, false);
  }

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

  // ★★★ ここからドラッグ＆ドロップのイベント処理 ★★★

  // (1) ドラッグ中のイベントがセルの上に乗っている間、継続的に発火
  dayDiv.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  });
  
  // (2) ドラッグ中のイベントがセルの領域に初めて入った時に発火
  dayDiv.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dayDiv.classList.add('drag-enter'); // CSSクラスを追加して枠線を表示
  });

  // (3) ドラッグ中のイベントがセルの領域から離れた時に発火
  dayDiv.addEventListener('dragleave', (e) => {
    dayDiv.classList.remove('drag-enter'); // CSSクラスを削除して枠線を消す
  });

  // (4) ドロップが実行された時に発火
  dayDiv.addEventListener('drop', async (e) => {
    e.preventDefault();
    dayDiv.classList.remove('drag-enter'); // ドロップ後も枠線を確実に消す

    const eventId = e.dataTransfer.getData('text/plain');
    const newStartDateStr = dayDiv.dataset.date;
    const userUId = localStorage.getItem("userUId");

    const originalEvent = getEvents().find(ev => ev._id === eventId);
    if (!originalEvent || !userUId) return;

    const originalStartDate = new Date(originalEvent.startDate);
    const newStartDate = new Date(newStartDateStr);
    const diffTime = newStartDate.getTime() - originalStartDate.getTime();
    
    const newEndDate = new Date(new Date(originalEvent.endDate || originalEvent.startDate).getTime() + diffTime);

    const updatedEventData = {
      ...originalEvent,
      startDate: formatDate(newStartDate),
      endDate: formatDate(newEndDate)
    };

    try {
      await updateEvent(userUId, eventId, updatedEventData);
      await refreshCalendar();
    } catch (error) {
      console.error('イベントの更新に失敗しました:', error);
      alert('イベントの移動に失敗しました。');
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

    const eventsOnThisDay = events.filter(ev => {
      const start = formatDate(new Date(ev.startDate));
      const end = formatDate(new Date(ev.endDate || ev.startDate));
      return dateStr >= start && dateStr <= end;
    });

    eventsOnThisDay.sort((a, b) => {
      const aIsMultiDay = (a.startDate !== (a.endDate || a.startDate));
      const bIsMultiDay = (b.startDate !== (b.endDate || b.startDate));

      // 1. 複数日イベントを単日イベントより常に優先する
      if (aIsMultiDay && !bIsMultiDay) return -1;
      if (!aIsMultiDay && bIsMultiDay) return 1;

      // 2. 複数日イベント同士の場合、開始日が早い順に並べる
      if (aIsMultiDay && bIsMultiDay) {
        const aStart = new Date(a.startDate);
        const bStart = new Date(b.startDate);
        return aStart - bStart;
      }
      
      // 3. 単日イベント同士の場合、開始時刻が早い順に並べる
      if (!aIsMultiDay && !bIsMultiDay) {
        const aTime = a.startTime || '00:00';
        const bTime = b.startTime || '00:00';
        if (aTime < bTime) return -1;
        if (aTime > bTime) return 1;
      }

      return 0;
    });

    let multiDayOffset = 4; // 帯イベントの垂直位置の初期値 (px)
    const singleDayEvents = []; // 単日イベントを一時的に保持する配列

    // 最初に複数日イベントだけを処理
    eventsOnThisDay.forEach(event => {
      const isMultiDay = (event.startDate !== (event.endDate || event.startDate));

      if (isMultiDay) {
        const eventDiv = document.createElement('div');
        eventDiv.classList.add('multi-day-event-segment');
        
        // 帯イベントの垂直位置を動的に設定
        eventDiv.style.top = `${multiDayOffset}px`;
        multiDayOffset += 28; // 次の帯イベントのために高さをずらす (25pxの高さ + 3pxのマージン)

        const startDateStr = formatDate(new Date(event.startDate));
        const endDateStr = formatDate(new Date(event.endDate));
        if (dateStr === startDateStr) {
          eventDiv.classList.add('event-starts');
          eventDiv.textContent = event.eventName;
        } else if (dateStr === endDateStr) {
          eventDiv.classList.add('event-ends');
        } else {
          eventDiv.classList.add('event-continues');
        }

        // 共通のスタイルとイベントリスナー
        eventDiv.style.backgroundColor = event.color || '#1a73e8';
        eventDiv.draggable = true;
        eventDiv.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', event._id));
        eventDiv.addEventListener('click', (e) => { e.stopPropagation(); showEventDetails(event, refreshCalendar); });
        
        eventsContainer.appendChild(eventDiv);

      } else {
        // 単日イベントは後で処理するために配列に保存
        singleDayEvents.push(event);
      }
    });

    // 複数日イベントが占有した高さ分、コンテナにpadding-topを設定
    if (multiDayOffset > 4) {
      eventsContainer.style.paddingTop = `${multiDayOffset}px`;
    }

    // 次に単日イベントを処理
    singleDayEvents.forEach(event => {
      const eventDiv = document.createElement('div');
      eventDiv.classList.add('single-day-event');
      eventDiv.textContent = event.eventName;
      
      // 共通のスタイルとイベントリスナー
      eventDiv.style.backgroundColor = event.color || '#1a73e8';
      eventDiv.draggable = true;
      eventDiv.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', event._id));
      eventDiv.addEventListener('click', (e) => { e.stopPropagation(); showEventDetails(event, refreshCalendar); });
      
      eventsContainer.appendChild(eventDiv);
    });
       // ▲▲▲【修正ここまで】▲▲▲
  });
}

/** ヘッダーの日付表示を、現在のビューに応じて更新する */
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
  } else {
    dateText = `${year}年 ${t.monthNames[month]} ${day}日`;
  }
  document.getElementById('current-date').textContent = dateText;
}


/**
 * 共通のドロップ処理
 * @param {DragEvent} e ドラッグイベント
 * @param {HTMLElement} dayBodyEl ドロップされた日のボディ要素
 */
async function handleTimelineDrop(e, dayBodyEl) {
    e.preventDefault();
    dayBodyEl.classList.remove('drag-over');

    const newDateStr = dayBodyEl.dataset.date;
    const userUId = localStorage.getItem("userUId");
    
    const eventId = dragContext ? dragContext.id : e.dataTransfer.getData('text/plain');
    if (!eventId) { dragContext = null; return; }

    const originalEvent = getEvents().find(ev => ev._id === eventId);
    if (!originalEvent || !userUId) { dragContext = null; return; }

    let updatedEventData;

    if (dragContext && originalEvent.startTime) {
        const dragOffsetY = dragContext.offsetY || 0;
        const rect = dayBodyEl.getBoundingClientRect();
        const dropYInDayBody = e.clientY - rect.top;

        // ★★★ 15分単位にスナップする計算 ★★★
        const rawStartTotalMinutes = Math.max(0, dropYInDayBody - dragOffsetY);
        const snappedStartTotalMinutes = Math.round(rawStartTotalMinutes / 15) * 15;

        const newStartHour = Math.floor(snappedStartTotalMinutes / 60);
        const newStartMinute = snappedStartTotalMinutes % 60;
        const newStartTime = `${String(newStartHour).padStart(2, '0')}:${String(newStartMinute).padStart(2, '0')}`;
        
        const [startH, startM] = originalEvent.startTime.split(':').map(Number);
        const [endH, endM] = originalEvent.endTime.split(':').map(Number);
        const durationMinutes = (endH * 60 + endM) - (startH * 60 + startM);
        const newEndTotalMinutes = snappedStartTotalMinutes + durationMinutes;
        const newEndHour = Math.floor(newEndTotalMinutes / 60);
        const newEndMinute = newEndTotalMinutes % 60;
        const newEndTime = `${String(newEndHour).padStart(2, '0')}:${String(newEndMinute).padStart(2, '0')}`;

        updatedEventData = { ...originalEvent, startDate: newDateStr, endDate: newDateStr, startTime: newStartTime, endTime: newEndTime };
    } else {
        const originalStartDate = new Date(originalEvent.startDate);
        const newStartDate = new Date(newDateStr);
        const diffTime = newStartDate.getTime() - originalStartDate.getTime();
        const newEndDate = new Date(new Date(originalEvent.endDate || originalEvent.startDate).getTime() + diffTime);
        updatedEventData = { ...originalEvent, startDate: formatDate(newStartDate), endDate: formatDate(newEndDate) };
    }

    try {
        await updateEvent(userUId, eventId, updatedEventData);
        await refreshCalendar();
    } catch (error) {
        console.error('イベントの更新に失敗しました:', error);
        alert('イベントの移動に失敗しました。');
    } finally {
        dragContext = null;
    }
}


/** 週表示ビューを生成する */
export function createWeekView() {
  document.querySelector('.weekdays').style.display = 'grid';
  const view = document.getElementById('week-view');
  view.innerHTML = '';
  const current = getCurrentDate();
  const startOfWeek = new Date(current);
  startOfWeek.setDate(current.getDate() - current.getDay());

  view.appendChild(document.createElement('div')).className = 'week-top-left';
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const headerCell = view.appendChild(document.createElement('div'));
    headerCell.className = 'week-header-cell';
    headerCell.innerHTML = `<div class="week-header-date">${date.getMonth() + 1}/${date.getDate()}</div><div class="all-day-events-container"></div>`;
  }

  const timeAxis = view.appendChild(document.createElement('div'));
  timeAxis.className = 'week-time-axis';
  for (let hour = 0; hour < 24; hour++) {
    const label = timeAxis.appendChild(document.createElement('div'));
    label.className = 'time-label';
    label.textContent = `${hour}:00`;
    label.style.top = `${hour * 60}px`;
  }

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr = formatDate(date);
    
    const dayBody = view.appendChild(document.createElement('div'));
    dayBody.className = 'week-day-body';
    dayBody.dataset.date = dateStr;

    dayBody.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; dayBody.classList.add('drag-over'); });
    dayBody.addEventListener('dragleave', () => dayBody.classList.remove('drag-over'));
    dayBody.addEventListener('drop', (e) => handleTimelineDrop(e, dayBody));

    for (let hour = 0; hour < 24; hour++) {
        const slot = dayBody.appendChild(document.createElement('div'));
        slot.className = 'time-slot';
        slot.style.top = `${hour * 60}px`;
    }
    
    const eventsOnThisDay = getEvents().filter(ev => {
      const start = formatDate(new Date(ev.startDate));
      const end = formatDate(new Date(ev.endDate || ev.startDate));
      return dateStr >= start && dateStr <= end;
    });

    eventsOnThisDay.forEach(event => {
      if (!event.startTime || !event.endTime) {
        const container = view.querySelectorAll('.all-day-events-container')[i];
        if(container) {
            const eventDiv = container.appendChild(document.createElement('div'));
            eventDiv.className = 'event-item';
            eventDiv.style.backgroundColor = event.color || '#1a73e8';
            eventDiv.textContent = event.eventName;
            eventDiv.draggable = true;
            eventDiv.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', event._id); e.dataTransfer.effectAllowed = 'move'; });
            eventDiv.addEventListener('click', (e) => { e.stopPropagation(); showEventDetails(event, refreshCalendar); });
        }
      } else {
        // ▼▼▼時間指定イベントの処理▼▼▼
        const eventStartDateTime = new Date(`${event.startDate}T${event.startTime}`);
        const eventEndDateTime = new Date(`${event.endDate}T${event.endTime}`);
        
        // 今描画している日の開始時刻（00:00）と終了時刻（23:59:59）
        const dayStartDateTime = new Date(`${dateStr}T00:00:00`);
        const dayEndDateTime = new Date(`${dateStr}T23:59:59`);

        // イベントの表示開始・終了時刻を、その日の範囲に収まるように計算
        const displayStartDateTime = new Date(Math.max(eventStartDateTime, dayStartDateTime));
        const displayEndDateTime = new Date(Math.min(eventEndDateTime, dayEndDateTime));

        // 表示すべき時間がない場合はスキップ（完全に過去または未来のイベント）
        if (displayStartDateTime >= displayEndDateTime) return;
        
        // top（分単位）を計算
        const top = displayStartDateTime.getHours() * 60 + displayStartDateTime.getMinutes();
        
        // height（分単位）を計算
        const height = (displayEndDateTime - displayStartDateTime) / 60000;
        
        const eventDiv = dayBody.appendChild(document.createElement('div'));
        eventDiv.className = 'day-event';
        eventDiv.style.top = `${top}px`;
        eventDiv.style.height = `${Math.max(20, height)}px`; // 最低でも20pxの高さを確保
        eventDiv.textContent = event.eventName;
        eventDiv.style.backgroundColor = event.color;
        eventDiv.draggable = true;
        
        eventDiv.addEventListener('dragstart', (e) => {
            dragContext = { id: event._id, offsetY: e.offsetY };
            e.dataTransfer.setData('text/plain', event._id);
            e.dataTransfer.effectAllowed = 'move';
        });
        eventDiv.addEventListener('dragend', () => { dragContext = null; });
        eventDiv.addEventListener('click', (e) => { e.stopPropagation(); showEventDetails(event, refreshCalendar); });
      }
    });
  }
}

/** 日表示ビューを生成する */
export function createDayView() {
  document.querySelector('.weekdays').style.display = 'none';

  const view = document.getElementById('day-view');
  view.innerHTML = '';
  const currentDateStr = formatDate(getCurrentDate());

  const timeAxis = view.appendChild(document.createElement('div'));
  timeAxis.className = 'day-time-axis';
  for (let hour = 0; hour < 24; hour++) {
    const label = timeAxis.appendChild(document.createElement('div'));
    label.className = 'time-label';
    label.textContent = `${hour}:00`;
    label.style.top = `${hour * 60}px`;
  }

  const dayBody = view.appendChild(document.createElement('div'));
  dayBody.className = 'day-events-body';
  dayBody.dataset.date = currentDateStr;

  dayBody.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; dayBody.classList.add('drag-over'); });
  dayBody.addEventListener('dragleave', () => dayBody.classList.remove('drag-over'));
  dayBody.addEventListener('drop', (e) => handleTimelineDrop(e, dayBody));

  for (let hour = 0; hour < 24; hour++) {
    const slot = dayBody.appendChild(document.createElement('div'));
    slot.className = 'time-slot';
    slot.style.top = `${hour * 60}px`;
  }

  // ▼▼▼日をまたぐイベントも取得できるようにフィルター条件を変更▼▼▼
  const todayEvents = getEvents().filter(ev => {
    const start = formatDate(new Date(ev.startDate));
    const end = formatDate(new Date(ev.endDate || ev.startDate));
    return currentDateStr >= start && currentDateStr <= end;
  });

  todayEvents.forEach(event => {
    if (!event.startTime || !event.endTime) {
      // 終日イベントの処理
      const container = view.querySelector('.all-day-events-container');
      if (container) {
          const eventDiv = container.appendChild(document.createElement('div'));
          eventDiv.className = 'event-item';
          eventDiv.style.backgroundColor = event.color || '#1a73e8';
          eventDiv.textContent = event.eventName;
          eventDiv.draggable = true;
          eventDiv.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', event._id); e.dataTransfer.effectAllowed = 'move'; });
          eventDiv.addEventListener('click', (e) => { e.stopPropagation(); showEventDetails(event, refreshCalendar); });
      }
    } else {
      // ▼▼▼時間指定イベントの処理（週表示と全く同じロジック）▼▼▼
      const eventStartDateTime = new Date(`${event.startDate}T${event.startTime}`);
      const eventEndDateTime = new Date(`${event.endDate}T${event.endTime}`);
      const dayStartDateTime = new Date(`${currentDateStr}T00:00:00`);
      const dayEndDateTime = new Date(`${currentDateStr}T23:59:59`);

      const displayStartDateTime = new Date(Math.max(eventStartDateTime, dayStartDateTime));
      const displayEndDateTime = new Date(Math.min(eventEndDateTime, dayEndDateTime));

      if (displayStartDateTime >= displayEndDateTime) return;
      
      const top = displayStartDateTime.getHours() * 60 + displayStartDateTime.getMinutes();
      const height = (displayEndDateTime - displayStartDateTime) / 60000;

      const eventDiv = dayBody.appendChild(document.createElement('div'));
      eventDiv.className = 'day-event';
      eventDiv.style.top = `${top}px`;
      eventDiv.style.height = `${Math.max(20, height)}px`;
      eventDiv.textContent = event.eventName;
      eventDiv.style.backgroundColor = event.color;
      eventDiv.draggable = true;

      eventDiv.addEventListener('dragstart', (e) => {
          dragContext = { id: event._id, offsetY: e.offsetY };
          e.dataTransfer.setData('text/plain', event._id);
          e.dataTransfer.effectAllowed = 'move';
      });
      eventDiv.addEventListener('dragend', () => { dragContext = null; });
      eventDiv.addEventListener('click', (e) => { e.stopPropagation(); showEventDetails(event, refreshCalendar); });
    }
  });
}