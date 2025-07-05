// lang.js
export const texts = {
  ja: {
    pageTitle: 'マイカレンダー',
    weekdays: ['日', '月', '火', '水', '木', '金', '土'],
    monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    calendar: 'カレンダー',
    profile: 'プロフィール',
    settings: '設定',
    changeHeader: 'ヘッダー画像変更',
    chat: '💬 チャット',
    apiSetting: 'API設定',
    addEvent: '予定を追加',
    save: '保存',
    delete: '削除',
    welcome: 'ようこそ',
    graphicQuality: 'グラフィック品質',
    moods: ['すごく良い', '良い', '普通', '悪い', 'すごく悪い'],
    volumeControl: '音量調節' // ★音量調節のテキストを追加
  },
  en: {
    pageTitle: 'My Calendar',
    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    calendar: 'Calendar',
    profile: 'Profile',
    settings: 'Settings',
    changeHeader: 'Change Header Image',
    chat: '💬 Chat',
    apiSetting: 'API Settings',
    addEvent: 'Add Event',
    save: 'Save',
    delete: 'Delete',
    welcome: 'Welcome',
    graphicQuality: 'Graphic Quality',
    moods: ['Excellent', 'Good', 'Average', 'Poor', 'Terrible'],
    volumeControl: 'Volume Control' // ★音量調節のテキストを追加
  },
  ru: {
      pageTitle: 'Мой календарь',
      weekdays: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
      calendar: 'Календарь',
      profile: 'Профиль',
      settings: 'Настройки',
      changeHeader: 'Изменить изображение шапки',
      chat: '💬 Чат',
      apiSetting: 'Настройки API',
      addEvent: 'Добавить событие',
      save: 'Сохранить',
      delete: 'Удалить',
      welcome: 'Добро пожаловать',
      graphicQuality: 'Качество графики',
      moods: ['Отлично', 'Хорошо', 'Обычно', 'Плохо', 'Ужасно'],
      volumeControl: 'Регулировка громкости' // ★音量調節のテキストを追加
    },
    zh: {
      pageTitle: '我的日曆',
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      calendar: '日曆',
      profile: '個人資料',
      settings: '設定',
      changeHeader: '更換標題圖片',
      chat: '💬 聊天',
      apiSetting: 'API設定',
      addEvent: '新增事件',
      save: '儲存',
      delete: '刪除',
      welcome: '歡迎',
      graphicQuality: '圖像品質',
      moods: ['非常好', '好', '普通', '差', '非常差'],
      volumeControl: '音量控制' // ★音量調節のテキストを追加
    }
};

export function applyLang(lang, userName = '') {
  const t = texts[lang];

  // ページタイトル (h1)
  const pageTitle = document.querySelector('.main-header h1');
  if (pageTitle) {
    pageTitle.textContent = t.pageTitle;
  }

  // 曜日の表示 (カレンダーページのみ)
  const weekdaysContainer = document.querySelector('.weekdays');
  if (weekdaysContainer) {
      weekdaysContainer.innerHTML = ''; // コンテナをクリア
      t.weekdays.forEach(day => {
          const dayDiv = document.createElement('div');
          dayDiv.textContent = day;
          weekdaysContainer.appendChild(dayDiv);
      });
  }

  if (document.querySelector('a[href="calendar.html"]')) {
    document.querySelector('a[href="calendar.html"]').textContent = t.calendar;
  }
  if (document.querySelector('a[href="profile.html"]')) {
    document.querySelector('a[href="profile.html"]').textContent = t.profile;
  }
  if (document.querySelector('a[href="settings.html"]')) {
    document.querySelector('a[href="settings.html"]').textContent = t.settings;
  }
  if (document.getElementById('changeHeaderImgBtn')) {
    document.getElementById('changeHeaderImgBtn').textContent = t.changeHeader;
  }
  if (document.getElementById('chatToggle')) {
    document.getElementById('chatToggle').textContent = t.chat;
  }
  if (document.getElementById('openApiSetting')) {
    document.getElementById('openApiSetting').textContent = t.apiSetting;
  }
  const eventModalTitle = document.querySelector('#eventModal h3');
  if (eventModalTitle) {
    eventModalTitle.textContent = t.addEvent;
  }
  const saveButton = document.querySelector('#eventForm button[type="submit"]');
  if (saveButton) {
    saveButton.textContent = t.save;
  }
  if (document.getElementById('deleteEventBtn')) {
    document.getElementById('deleteEventBtn').textContent = t.delete;
  }
  if (document.getElementById('welcomeMsg')) {
    const welcomeMessage = texts[lang].welcome;
    const userDisplayName = userName || localStorage.getItem("userName") || "";
    document.getElementById('welcomeMsg').textContent = `${welcomeMessage} ${userDisplayName} さん`;
  }
  const qualityHeading = document.querySelector('.feedback-section h3');
  if (qualityHeading) qualityHeading.textContent = t.graphicQuality;

  const moodLabels = document.querySelectorAll('.mood-buttons label');
  if (moodLabels.length > 0 && t.moods) {
    moodLabels.forEach((label, i) => {
      if(t.moods[i]) {
        // input要素は保持しつつテキストだけを更新
        const input = label.querySelector('input') || label.previousElementSibling;
        label.textContent = t.moods[i];
        if(input) label.prepend(input);
      }
    });
  }

  // ★音量調節のテキストを適用する処理を追加
  const volumeHeading = document.querySelector('.volume-section h3');
  if (volumeHeading) {
    volumeHeading.textContent = t.volumeControl;
  }
}