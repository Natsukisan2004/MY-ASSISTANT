calendar/
├── index.html                ... ログインページ
├── calendar.html             ... カレンダー画面
├── style.css                 ... スタイル全般
├── firebase-config.js        ... Firebaseの設定
└── js/
    ├── main.js               ... 初期化処理、エントリーポイント
    ├── auth.js               ... Firebase認証処理（initAuth, onAuthReady）
    ├── eventStorage.js       ... Firestoreとの保存・読み込み・削除
    ├── calendar.js           ... カレンダー構築、表示、イベント描画
    ├── eventModal.js         ... モーダルUI表示処理（詳細表示、確認表示）
    └── chatAssistant.js      ... 音声認識・OpenAI連携処理
