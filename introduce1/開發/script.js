let currentDate = new Date(2025, 4, 27); // 2025年5月27日
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

// ローカル日付を 'YYYY-MM-DD' 形式でフォーマットする関数
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
    alert(`予定の詳細:\n\n日付: ${event.date}\n時間: ${event.time}\n場所: ${event.location}\nメモ: ${event.note}`);
}

document.querySelector('.close').onclick = function () {
    const modal = document.getElementById('eventModal');
    modal.classList.remove('show'); // 中央表示を解除
};




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

document.getElementById('prevMonth').onclick = function() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    createCalendar();
};

document.getElementById('nextMonth').onclick = function() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    createCalendar();
};

// ✅ 修正済み：タイムゾーンのズレを防ぐ
function openEventModal(date) {
    const modal = document.getElementById('eventModal');
    document.getElementById('eventDate').value = formatDate(date); // ローカル時間使用
    modal.classList.add('show');
}

// 初期表示
createCalendar();
renderEvents();
