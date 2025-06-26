import { showEventConfirm } from './eventModal.js';

export function initChatAssistant({ micBtnId, inputId, chatFormId, messagesId }) {
  const micBtn = document.getElementById(micBtnId);
  const userInput = document.getElementById(inputId);
  const chatForm = document.getElementById(chatFormId);
  const chatMessages = document.getElementById(messagesId);

  // 音声認識設定
  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.continuous = false;
    recognition.interimResults = false;

    micBtn.addEventListener('click', () => {
      recognition.start();
      micBtn.disabled = true;
      micBtn.textContent = '🎤...';
    });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      userInput.value = transcript;
    };

    recognition.onend = () => {
      micBtn.disabled = false;
      micBtn.textContent = '🎤';
    };

    recognition.onerror = () => {
      micBtn.disabled = false;
      micBtn.textContent = '🎤';
    };
  } else {
    micBtn.disabled = true;
    micBtn.title = 'このブラウザは音声認識に対応していません';
  }

  // チャット送信処理
  if (chatForm && userInput && chatMessages) {
    chatForm.onsubmit = (e) => {
      e.preventDefault();
      const text = userInput.value.trim();
      if (!text) return;

      const userMsg = document.createElement('div');
      userMsg.textContent = "👤 " + text;
      chatMessages.appendChild(userMsg);

      const apiUrl = localStorage.getItem('openai_api_url') || 'https://api.openai.com/v1/chat/completions';
      const apiKey = localStorage.getItem('openai_api_key') || '';

      const todayStr = new Date().toISOString().slice(0, 10);

      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `今日は${todayStr}です。ユーザーが話した内容からカレンダーイベントを抽出し、JSONで返してください。例: {"startDate":"2025-06-25","endDate":"2025-06-25","time":"14:00","location":"渋谷","note":"打ち合わせ"}`
            },
            {
              role: 'user',
              content: text
            }
          ]
        })
      })
      .then(res => res.json())
      .then(data => {
        const content = data.choices?.[0]?.message?.content;
        try {
          const eventObj = JSON.parse(content);
          showEventConfirm(eventObj, (confirmedEvent) => {
            if (typeof window.onChatConfirmed === 'function') {
              window.onChatConfirmed(confirmedEvent); // main.js 側で定義された処理
            }
          });
        } catch {
          alert("AIの返答を解析できません: " + content);
        }
      })
      .catch(err => {
        alert("AIエラー: " + err.message);
      });

      userInput.value = '';
    };
  }
}
