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

// 更新日曆創建邏輯
function createCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    document.getElementById('current-date').textContent = 
        `${year}年${month + 1}月`;

    const calendar = document.getElementById('calendar');
    
    // 根據 2025/5/27 是周二來計算
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    
    // 清空日曆
    calendar.innerHTML = '';
    
    // 計算上個月的天數
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    
    // 添加上個月的日期
    for (let i = startingDay - 1; i >= 0; i--) {
        const day = prevMonthLastDay - i;
        const date = new Date(year, month - 1, day);
        addDayToCalendar(date, true);
    }

    // 添加當前月份的日期
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
    dayDiv.dataset.date = date.toISOString().split('T')[0];
    
    if (date.toDateString() === new Date().toDateString()) {
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
    // イベント詳細表示のモーダル実装
    // ...
}

// モーダルを閉じる
document.querySelector('.close').onclick = function() {
    document.getElementById('eventModal').style.display = 'none';
}

// イベント追加のフォーム送信処理
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
    
    // モーダルを閉じるアニメーション
    const modal = document.getElementById('eventModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
    
    renderEvents();
    createCalendar();
};

// 月切り替えボタンの処理
document.getElementById('prevMonth').onclick = function() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    createCalendar();
};

document.getElementById('nextMonth').onclick = function() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    createCalendar();
};

function openEventModal(date) {
    const modal = document.getElementById('eventModal');
    document.getElementById('eventDate').value = date.toISOString().split('T')[0];
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

// 初期表示
createCalendar();
renderEvents();
