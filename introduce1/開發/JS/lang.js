// lang.js
export const texts = {
    ja: {
      calendar: 'カレンダー',
      profile: 'プロフィール',
      settings: '設定',
      changeHeader: 'ヘッダー画像変更',
      chat: '💬 チャット',
      apiSetting: 'API設定',
      addEvent: '予定を追加',
      save: '保存',
      delete: '削除',
      welcome: 'ようこそ'
    },
    en: {
      calendar: 'Calendar',
      profile: 'Profile',
      settings: 'Settings',
      changeHeader: 'Change Header Image',
      chat: '💬 Chat',
      apiSetting: 'API Settings',
      addEvent: 'Add Event',
      save: 'Save',
      delete: 'Delete',
      welcome: 'Welcome'
    },
    ru: {
        calendar: 'Календарь',
        profile: 'Профиль',
        settings: 'Настройки',
        changeHeader: 'Изменить изображение шапки',
        chat: '💬 Чат',
        apiSetting: 'Настройки API',
        addEvent: 'Добавить событие',
        save: 'Сохранить',
        delete: 'Удалить',
        welcome: 'Добро пожаловать'
      },

      zh: {
        calendar: '日曆',
        profile: '個人資料',
        settings: '設定',
        changeHeader: '更換標題圖片',
        chat: '💬 聊天',
        apiSetting: 'API設定',
        addEvent: '新增事件',
        save: '儲存',
        delete: '刪除',
        welcome: '歡迎'
      }
    };
    // 他の言語も同様に
  
    export function applyLang(lang, userName = '') {
        const t = texts[lang];
      
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
        if (document.querySelector('#eventModal h3')) {
          document.querySelector('#eventModal h3').textContent = t.addEvent;
        }
        if (document.querySelector('#eventForm button[type="submit"]')) {
          document.querySelector('#eventForm button[type="submit"]').textContent = t.save;
        }
        if (document.getElementById('deleteEventBtn')) {
          document.getElementById('deleteEventBtn').textContent = t.delete;
        }
        if (document.getElementById('welcomeMsg')) {
          document.getElementById('welcomeMsg').textContent = `${t.welcome} ${userName} さん`;
        }
      }