const today = new Date();
const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
const calendar = document.getElementById('calendar');
const events = {};

for (let i = 1; i <= daysInMonth; i++) {
  const dayBox = document.createElement('div');
  dayBox.className = 'day';

  const dayNum = document.createElement('div');
  dayNum.className = 'day-number';
  dayNum.innerText = i;

  const addBtn = document.createElement('div');
  addBtn.className = 'add-btn';
  addBtn.innerText = '+';
  addBtn.onclick = () => {
    const title = prompt(`Add event for ${i}/${today.getMonth() + 1}`);
    if (title) {
      if (!events[i]) events[i] = [];
      events[i].push(title);
      renderEvents(i);
    }
  };

  dayBox.appendChild(dayNum);
  dayBox.appendChild(addBtn);
  dayBox.setAttribute('data-day', i);
  calendar.appendChild(dayBox);
}

function renderEvents(day) {
  const dayBox = document.querySelector(`.day[data-day="${day}"]`);
  const oldEvents = dayBox.querySelectorAll('.event');
  oldEvents.forEach(e => e.remove());

  events[day].forEach(e => {
    const ev = document.createElement('div');
    ev.className = 'event';
    ev.innerText = e;
    dayBox.appendChild(ev);
  });
}
