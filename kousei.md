calendar/
│
├── 📁 introduce1/
│       ├── index.html                ... ログインページ
│       calendar.html             ... ログイン後のメイン画面。カレンダー、各種モーダル、チャットUIの土台となるHTML
│       ├── profile.html              ... プロフィール画面（ナビゲーションから推測）
│       ├── settings.html             ... 設定画面（ナビゲーションから推測）
│       ├── style.css                 ... アプリケーション全体のスタイルシート
│       ├── firebase-config.js        ... Firebaseプロジェクトの接続情報など、初期設定を記述
│       └── js/
│           ├── main.js               ... アプリ全体の初期化、イベントリスナー（月移動、フォーム送信等）の設定、各モジュールの連携を行う中心的なファイル
│           ├── auth.js               ... Firebase Authenticationによるログイン・ログアウトなどの認証処理
│           ├── eventStorage.js       ... Firestoreデータベースとのイベントデータの保存、読み込み、更新、削除
│           ├── calendar.js           ... カレンダーのHTML構築、日付の表示、イベントの描画処理
│           ├── eventModal.js         ... イベントの「詳細表示」「削除確認」など、動的に生成されるポップアップ（モーダル）のUI処理
│           ├── chatAssistant.js      ... AIアシスタント機能（チャットUI、音声認識、画像認識(OCR)、外部AI API連携）の管理
│           └── lang.js                 ... 多言語対応のためのテキストデータと、言語を適用する処理
│
│
├── 📁 functions/ 
│   ├── index.js
│   └── ... (package.json など)
│
├── firebase.json
└── .firebaserc