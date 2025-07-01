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
      welcome: 'ようこそ',
      graphicQuality: 'グラフィック品質',
      moods: ['すごく良い', '良い', '普通', '悪い', 'すごく悪い']
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
      welcome: 'Welcome',
      graphicQuality: 'Graphic Quality',
      moods: ['Excellent', 'Good', 'Average', 'Poor', 'Terrible']
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
        welcome: 'Добро пожаловать',
        graphicQuality: 'Качество графики',
        moods: ['Отлично', 'Хорошо', 'Обычно', 'Плохо', 'Ужасно']
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
        welcome: '歡迎',
        graphicQuality: '圖像品質',
        moods: ['非常好', '好', '普通', '差', '非常差']
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
        const qualityHeading = document.querySelector('.feedback-section h3');
        if (qualityHeading) qualityHeading.textContent = t.graphicQuality;
      
        const moodLabels = document.querySelectorAll('.mood-buttons label');
        if (moodLabels.length === 5 && t.moods) {
          moodLabels.forEach((label, i) => {
            label.textContent = t.moods[i];
          });
        }
      }

      