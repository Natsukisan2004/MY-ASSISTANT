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
    send: '送信',
    delete: '削除',
    welcome: 'ようこそ',
    graphicQuality: 'グラフィック品質',
    moods: ['すごく良い', '良い', '普通', '悪い', 'すごく悪い'],
    volumeControl: '音量調節',
    // AI & OCR 関連
    ocrLanguage: 'jpn',
    aiSystemPrompt: 'あなたは日本語のカレンダーアシスタントです。今日は{todayStr}です。ユーザーが話した内容からカレンダーイベントを抽出し、必ずJSON形式で返してください。例: {"startDate":"2025-01-15","endDate":"2025-01-15","time":"14:00","location":"東京","note":"会議"}',
    ocrSuccess: '✅ 認識成功！{count} 文字を抽出しました',
    ocrFailed: '❌ 認識失敗：{error}',
    ocrProcessing: '📷 画像を認識中...',
    thinkingMessage: '🤖 考え中...',
    userInputPlaceholder: '予定を教えてください...',
    pasteHint: 'Ctrl+V で画像を貼り付け',
    dropZoneText: 'ドラッグ&ドロップ • クリック • Ctrl+V貼り付け',
    dropZoneSubtext: 'JPG, PNG, GIF 対応 • ファイルサイズ ≤ 1MB',
    clipboardDetected: '📋 クリップボード画像を検出しました、処理中...',
    clipboardTip: '💡 ヒント：Ctrl+V でいつでもスクリーンショットや画像を貼り付けできます！',
    clipboardNoImage: '📋 クリップボードに画像が見つかりません。画像をコピーしてからお試しください',
    welcomeChat: '🎉 スマートスケジュールアシスタントへようこそ！',
    chatFeatures: '💡 3つの方法で予定を追加できます：\n📝 テキスト入力 • 🎤 音声入力 • 📷 画像認識',
    pasteShortcut: '⚡ ヒント：画像をコピーしてCtrl+Vで素早く貼り付け認識！',
    ocrResult: '📷 画像認識結果：{text}',
    ocrToAiPrompt: '以下の画像認識内容から予定を作成してください：{text}'
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
    send: 'Send',
    delete: 'Delete',
    welcome: 'Welcome',
    graphicQuality: 'Graphic Quality',
    moods: ['Excellent', 'Good', 'Average', 'Poor', 'Terrible'],
    volumeControl: 'Volume Control',
    // AI & OCR Related
    ocrLanguage: 'eng',
    aiSystemPrompt: 'You are an English calendar assistant. Today is {todayStr}. Extract calendar events from what the user says and return them in JSON format. Example: {"startDate":"2025-01-15","endDate":"2025-01-15","time":"14:00","location":"New York","note":"Meeting"}',
    ocrSuccess: '✅ Recognition successful! Extracted {count} characters',
    ocrFailed: '❌ Recognition failed: {error}',
    ocrProcessing: '📷 Recognizing image...',
    thinkingMessage: '🤖 Thinking...',
    userInputPlaceholder: 'Tell me about your schedule...',
    pasteHint: 'Ctrl+V to paste image',
    dropZoneText: 'Drag & Drop • Click Upload • Ctrl+V Paste',
    dropZoneSubtext: 'Supports JPG, PNG, GIF • File size ≤ 1MB',
    clipboardDetected: '📋 Clipboard image detected, processing...',
    clipboardTip: '💡 Tip: You can always use Ctrl+V to quickly paste screenshots or copied images!',
    clipboardNoImage: '📋 No image found in clipboard. Please copy an image and try again',
    welcomeChat: '🎉 Welcome to Smart Schedule Assistant!',
    chatFeatures: '💡 Add events in 3 ways:\n📝 Text input • 🎤 Voice input • 📷 Image recognition',
    pasteShortcut: '⚡ Tip: Copy images and press Ctrl+V for quick recognition!',
    ocrResult: '📷 Image recognition result: {text}',
    ocrToAiPrompt: 'Please create a schedule from the following image recognition content: {text}'
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
      volumeControl: 'Регулировка громкости'
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
      send: '發送',
      delete: '刪除',
      welcome: '歡迎',
      graphicQuality: '圖像品質',
      moods: ['非常好', '好', '普通', '差', '非常差'],
      volumeControl: '音量控制',
      // AI & OCR 相關
      ocrLanguage: 'chs',
      aiSystemPrompt: '你是一個中文行事曆助手。今天是{todayStr}。請從用戶的輸入中提取行事曆事件，並以JSON格式返回。例: {"startDate":"2025-01-15","endDate":"2025-01-15","time":"14:00","location":"台北","note":"會議"}',
      ocrSuccess: '✅ 識別成功！提取了 {count} 個字符',
      ocrFailed: '❌ 識別失敗：{error}',
      ocrProcessing: '📷 正在識別圖片...',
      thinkingMessage: '🤖 思考中...',
      userInputPlaceholder: '請告訴我您的日程安排...',
      pasteHint: 'Ctrl+V 粘貼圖片',
      dropZoneText: '拖拽圖片 • 點擊上傳 • Ctrl+V粘貼',
      dropZoneSubtext: '支持 JPG, PNG, GIF 格式 • 文件大小 ≤ 1MB',
      clipboardDetected: '📋 檢測到剪貼板圖片，正在處理...',
      clipboardTip: '💡 小貼士：您可以隨時使用 Ctrl+V 快速粘貼截圖或複製的圖片！',
      clipboardNoImage: '📋 剪貼板中沒有檢測到圖片，請複製圖片後再試',
      welcomeChat: '🎉 歡迎使用智能日程助手！',
      chatFeatures: '💡 支持三種方式添加日程：\n📝 文字輸入 • 🎤 語音輸入 • 📷 圖片識別',
      pasteShortcut: '⚡ 小貼士：複製圖片後按 Ctrl+V 可快速粘貼識別！',
      ocrResult: '📷 圖片識別結果：{text}',
      ocrToAiPrompt: '請根據以下圖片識別的內容創建日程：{text}'
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

  // ▼▼▼ ここが修正箇所です ▼▼▼
  const moodLabels = document.querySelectorAll('.mood-buttons label');
  if (moodLabels.length > 0 && t.moods) {
    moodLabels.forEach((label, i) => {
      if (t.moods[i]) {
        // ラベルのテキストだけを更新し、HTML構造は変更しない
        label.textContent = t.moods[i];
      }
    });
  }
  // ▲▲▲ 修正箇所ここまで ▲▲▲

  // 音量調節のテキストを適用する処理
  const volumeHeading = document.querySelector('.volume-section h3');
  if (volumeHeading) {
    volumeHeading.textContent = t.volumeControl;
  }
}