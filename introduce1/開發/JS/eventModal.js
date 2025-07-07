import { deleteEvent, updateEvent } from './eventStorage.js';

const userUId = localStorage.getItem("userUId");

// イベント詳細表示モーダル（編集・削除ボタン付き）
export function showEventDetails(event, onDelete) {
  const modal = document.createElement('div');
  modal.className = 'event-detail-popup';
  modal.innerHTML = `
    <div class="event-detail-modal">
      <h3>予定の詳細</h3>
      <p><strong>開始日:</strong> ${event.startDate}</p>
      <p><strong>終了日:</strong> ${event.endDate || event.startDate}</p>
      <p><strong>時間:</strong> ${event.time}</p>
      <p><strong>場所:</strong> ${event.location}</p>
      <p><strong>メモ:</strong> ${event.note}</p>
      <div class="button-row">
        <button id="editEventBtn">✏️ 編集</button>
        <button id="deleteEventBtn">🗑 削除</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // 編集ボタン処理
  document.getElementById('editEventBtn').onclick = () => {
    openEventModalForEdit(event);
    document.body.removeChild(modal);
  };

  // 削除ボタン処理（確認モーダル）
  document.getElementById('deleteEventBtn').onclick = () => {
    showDeleteConfirm(event, () => {
      if (event._id && userUId) {
        deleteEvent(userUId, event._id, () => {
          if (typeof onDelete === 'function') onDelete();
          document.body.removeChild(modal);
        });
      } else {
        console.error("イベントIDまたはユーザーIDがありません");
      }
    });
  };

  modal.addEventListener('click', (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  });
}

// 削除確認モーダル
export function showDeleteConfirm(event, onConfirm) {
  const modal = document.createElement('div');
  modal.className = 'event-detail-popup';
  modal.innerHTML = `
    <div class="event-detail-modal">
      <h3>このイベントを削除してもよろしいですか？</h3>
      <p><strong>${event.note}</strong> - ${event.startDate} ${event.time}</p>
      <button id="confirmDeleteBtn">削除</button>
      <button id="cancelDeleteBtn">キャンセル</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('confirmDeleteBtn').onclick = () => {
    if (typeof onConfirm === 'function') onConfirm();
    document.body.removeChild(modal);
  };

  document.getElementById('cancelDeleteBtn').onclick = () => {
    document.body.removeChild(modal);
  };

  modal.addEventListener('click', (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  });
}

// AIが提案したイベントをユーザーが確認するモーダル
export function showEventConfirm(eventObj, onConfirm) {
  const modal = document.createElement('div');
  modal.className = 'event-detail-popup';
  modal.innerHTML = `
    <div class="event-detail-modal">
      <h3>🗓️ このイベントを追加しますか？</h3>
      <p><strong>開始日:</strong> ${eventObj.startDate}</p>
      <p><strong>終了日:</strong> ${eventObj.endDate || eventObj.startDate}</p>
      <p><strong>時間:</strong> ${eventObj.time}</p>
      <p><strong>場所:</strong> ${eventObj.location}</p>
      <p><strong>メモ:</strong> ${eventObj.note}</p>
      <div class="button-row">
        <button id="cancelAddEventBtn">キャンセル</button>
        <button id="confirmAddEventBtn">追加</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('confirmAddEventBtn').onclick = () => {
    if (typeof onConfirm === 'function') onConfirm(eventObj);
    document.body.removeChild(modal);
  };

  document.getElementById('cancelAddEventBtn').onclick = () => {
    document.body.removeChild(modal);
  };

  modal.addEventListener('click', (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  });
}

// 新規イベント追加モーダルを開く
export function openEventModal(date) {
  const eventModal = document.getElementById('eventModal');
  if (!eventModal) {
    console.error('eventModal 要素が見つかりません');
    return;
  }

  document.getElementById('eventDate').value = formatDate(date);
  document.getElementById('eventEndDate').value = formatDate(date);
  document.getElementById('eventTime').value = '';
  document.getElementById('eventLocation').value = '';
  document.getElementById('eventNote').value = '';
  document.querySelector('input[name="eventColor"][value="#1a73e8"]').checked = true;

  eventModal.dataset.editingId = ''; // 新規なので空
  eventModal.classList.add('show');
}

// 既存イベントを編集するためのモーダルを開く
export function openEventModalForEdit(event) {
  const eventModal = document.getElementById('eventModal');
  if (!eventModal) {
    console.error('eventModal 要素が見つかりません');
    return;
  }

  document.getElementById('eventDate').value = event.startDate;
  document.getElementById('eventEndDate').value = event.endDate || event.startDate;
  document.getElementById('eventTime').value = event.time || '';
  document.getElementById('eventLocation').value = event.location || '';
  document.getElementById('eventNote').value = event.note || '';
  if (event.color) {
    const colorRadio = document.querySelector(`input[name="eventColor"][value="${event.color}"]`);
    if (colorRadio) colorRadio.checked = true;
  }

  eventModal.dataset.editingId = event._id; // 編集対象IDを記録
  eventModal.classList.add('show');
}

// 日付フォーマット（共通関数）
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
