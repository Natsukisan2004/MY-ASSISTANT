import { deleteEvent } from './eventStorage.js';

const userUId = localStorage.getItem("userUId");

// イベント詳細表示モーダル（編集・削除ボタン付き）
export function showEventDetails(event, onDelete) {
  const modal = document.createElement('div');
  modal.className = 'event-detail-popup';
  modal.innerHTML = `
    <div class="event-detail-modal">
      <h3>${event.eventName || '予定の詳細'}</h3> <p><strong>開始:</strong> ${event.startDate} ${event.startTime}</p>
      <p><strong>終了:</strong> ${event.endDate} ${event.endTime}</p>
      <p><strong>場所:</strong> ${event.location}</p>
      <p><strong>メモ:</strong> ${event.note}</p>
      <div class="button-row">
        <button id="editEventBtn">✏️ 編集</button>
        <button id="deleteEventBtn">🗑 削除</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // --- イベントリスナー方式に修正 ---
  const editBtn = modal.querySelector('#editEventBtn');
  const deleteBtn = modal.querySelector('#deleteEventBtn');

  editBtn.addEventListener('click', () => {
    openEventModalForEdit(event);
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
  });

  deleteBtn.addEventListener('click', () => {
    showDeleteConfirm(event, async () => {
      if (!event._id || !userUId) {
        console.error("イベントIDまたはユーザーIDがありません");
        return;
      }
      try {
        await deleteEvent(userUId, event._id);
        if (typeof onDelete === 'function') {
          onDelete();
        }
      } catch (error) {
        console.error("❌ イベントの削除に失敗しました", error);
        alert("イベントの削除に失敗しました。");
      } finally {
        if (document.body.contains(modal)) {
          document.body.removeChild(modal);
        }
      }
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal && document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
  });
}

// 削除確認モーダル
export function showDeleteConfirm(event, onConfirm) {
  const modal = document.createElement('div');
  modal.className = 'event-detail-popup';
  modal.innerHTML = `
    <div class="event-detail-modal">
      <h3>このイベントを削除してもよろしいですか？</h3>
      <p><strong>${event.eventName}</strong> (${event.startDate} ${event.startTime})</p>
      <button id="confirmDeleteBtn">削除</button>
      <button id="cancelDeleteBtn">キャンセル</button>
    </div>
  `;
  document.body.appendChild(modal);

  // --- イベントリスナー方式に修正 ---
  const confirmBtn = modal.querySelector('#confirmDeleteBtn');
  const cancelBtn = modal.querySelector('#cancelDeleteBtn');

  confirmBtn.addEventListener('click', () => {
    if (typeof onConfirm === 'function') {
      onConfirm();
    }
    // このモーダルは、確認ボタンが押されたら必ず閉じる
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
  });

  cancelBtn.addEventListener('click', () => {
    if (document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal && document.body.contains(modal)) {
      document.body.removeChild(modal);
    }
  });
}

// AIが提案したイベントをユーザーが確認するモーダル
export function showEventConfirm(eventObj, onConfirm) {
  const modal = document.createElement('div');
  modal.className = 'event-detail-popup';
  let title = 'このイベントを追加しますか？';
  if (eventObj.action === 'update_event') title = 'このイベントを修正しますか？';
  if (eventObj.action === 'delete_event') title = 'このイベントを削除しますか？';
  modal.innerHTML = `
    <div class="event-detail-modal">
      <h3>${title}</h3>
      <p><strong>開始日:</strong> ${eventObj.startDate || ''}</p>
      <p><strong>終了日:</strong> ${eventObj.endDate || eventObj.startDate || ''}</p>
      <p><strong>時間:</strong> ${eventObj.startTime || ''} ～ ${eventObj.endTime || ''}</p>
      <p><strong>場所:</strong> ${eventObj.location || ''}</p>
      <p><strong>メモ:</strong> ${eventObj.note || ''}</p>
      <button id="confirmAddEventBtn">${eventObj.action === 'delete_event' ? '削除' : eventObj.action === 'update_event' ? '修正' : '追加'}</button>
      <button id="cancelAddEventBtn">キャンセル</button>
    </div>
  `;
  document.body.appendChild(modal);
  const confirmBtn = modal.querySelector('#confirmAddEventBtn');
  const cancelBtn = modal.querySelector('#cancelAddEventBtn');
  confirmBtn.addEventListener('click', () => {
    if (typeof onConfirm === 'function') onConfirm(eventObj);
    document.body.removeChild(modal);
  });
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  modal.addEventListener('click', (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  });
}

// 修改事件确认弹窗 - 显示变更前后对比
export function showUpdateEventConfirm(originalEvent, updatedEvent, onConfirm) {
  const modal = document.createElement('div');
  modal.className = 'event-detail-popup';
  modal.innerHTML = `
    <div class="event-detail-modal update-confirm-modal">
      <h3>📝 事件修改确认</h3>
      <div class="comparison-container">
        <div class="original-event">
          <h4>🔴 修改前</h4>
          <p><strong>事件名称:</strong> ${originalEvent.eventName || ''}</p>
          <p><strong>开始日期:</strong> ${originalEvent.startDate || ''}</p>
          <p><strong>结束日期:</strong> ${originalEvent.endDate || originalEvent.startDate || ''}</p>
          <p><strong>时间:</strong> ${originalEvent.startTime || ''} ～ ${originalEvent.endTime || ''}</p>
          <p><strong>地点:</strong> ${originalEvent.location || ''}</p>
          <p><strong>备注:</strong> ${originalEvent.note || ''}</p>
        </div>
        <div class="arrow">➡️</div>
        <div class="updated-event">
          <h4>🟢 修改后</h4>
          <p><strong>事件名称:</strong> ${updatedEvent.eventName || originalEvent.eventName || ''}</p>
          <p><strong>开始日期:</strong> ${updatedEvent.startDate || originalEvent.startDate || ''}</p>
          <p><strong>结束日期:</strong> ${updatedEvent.endDate || updatedEvent.startDate || originalEvent.endDate || originalEvent.startDate || ''}</p>
          <p><strong>时间:</strong> ${updatedEvent.startTime || originalEvent.startTime || ''} ～ ${updatedEvent.endTime || originalEvent.endTime || ''}</p>
          <p><strong>地点:</strong> ${updatedEvent.location || originalEvent.location || ''}</p>
          <p><strong>备注:</strong> ${updatedEvent.note || originalEvent.note || ''}</p>
        </div>
      </div>
      <div class="button-row">
        <button id="confirmUpdateBtn" class="confirm-btn">✅ 确认修改</button>
        <button id="cancelUpdateBtn" class="cancel-btn">❌ 取消</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  const confirmBtn = modal.querySelector('#confirmUpdateBtn');
  const cancelBtn = modal.querySelector('#cancelUpdateBtn');
  
  confirmBtn.addEventListener('click', () => {
    if (typeof onConfirm === 'function') onConfirm(updatedEvent);
    document.body.removeChild(modal);
  });
  
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  });
}

// 删除事件确认弹窗 - 显示要删除的事件详情
export function showDeleteEventConfirm(eventToDelete, onConfirm) {
  const modal = document.createElement('div');
  modal.className = 'event-detail-popup';
  modal.innerHTML = `
    <div class="event-detail-modal delete-confirm-modal">
      <h3>🗑️ 事件删除确认</h3>
      <div class="delete-warning">
        <p>⚠️ 您即将删除以下事件，此操作无法撤销：</p>
      </div>
      <div class="event-details">
        <p><strong>事件名称:</strong> ${eventToDelete.eventName || ''}</p>
        <p><strong>开始日期:</strong> ${eventToDelete.startDate || ''}</p>
        <p><strong>结束日期:</strong> ${eventToDelete.endDate || eventToDelete.startDate || ''}</p>
        <p><strong>时间:</strong> ${eventToDelete.startTime || ''} ～ ${eventToDelete.endTime || ''}</p>
        <p><strong>地点:</strong> ${eventToDelete.location || ''}</p>
        <p><strong>备注:</strong> ${eventToDelete.note || ''}</p>
      </div>
      <div class="button-row">
        <button id="confirmDeleteBtn" class="delete-btn">🗑️ 确认删除</button>
        <button id="cancelDeleteBtn" class="cancel-btn">❌ 取消</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  const confirmBtn = modal.querySelector('#confirmDeleteBtn');
  const cancelBtn = modal.querySelector('#cancelDeleteBtn');
  
  confirmBtn.addEventListener('click', () => {
    if (typeof onConfirm === 'function') onConfirm(eventToDelete);
    document.body.removeChild(modal);
  });
  
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
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
  document.getElementById('eventName').value = '';
  document.getElementById('eventDate').value = formatDate(date);
  document.getElementById('eventEndDate').value = formatDate(date);
  document.getElementById('eventStartTime').value = '';
  document.getElementById('eventEndTime').value = ''; 
  document.getElementById('eventLocation').value = '';
  document.getElementById('eventNote').value = '';
  document.querySelector('input[name="eventColor"][value="#1a73e8"]').checked = true;
  eventModal.dataset.editingId = '';
  eventModal.classList.add('show');
}

// 既存イベントを編集するためのモーダルを開く
export function openEventModalForEdit(event) {
  const eventModal = document.getElementById('eventModal');
  if (!eventModal) {
    console.error('eventModal 要素が見つかりません');
    return;
  }
  document.getElementById('eventName').value = event.eventName || '';
  document.getElementById('eventDate').value = event.startDate;
  document.getElementById('eventEndDate').value = event.endDate || event.startDate;
  document.getElementById('eventStartTime').value = event.startTime || '';
  document.getElementById('eventEndTime').value = event.endTime || '';
  document.getElementById('eventLocation').value = event.location || '';
  document.getElementById('eventNote').value = event.note || '';
  if (event.color) {
    const colorRadio = document.querySelector(`input[name="eventColor"][value="${event.color}"]`);
    if (colorRadio) colorRadio.checked = true;
  }
  eventModal.dataset.editingId = event._id;
  eventModal.classList.add('show');
}

// 日付フォーマット（共通関数）
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}