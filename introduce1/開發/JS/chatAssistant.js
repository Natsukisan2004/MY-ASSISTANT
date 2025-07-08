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

  // ヘルパー: ログ出力のみConsoleに
  function logAI(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    if (type === 'error') {
      console.error('[ChatAssistant]', timestamp, message);
    } else {
      console.log('[ChatAssistant]', timestamp, message);
    }
  }

  // 打字动画效果
  function typeWriter(element, text, speed = 30) {
    let i = 0;
    element.textContent = '';
    
    function type() {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, speed);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }
    type();
  }

  // 创建动画消息元素
  function createAnimatedMessage(content, className, isTyping = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', className);
    
    if (isTyping) {
      messageDiv.style.opacity = '0';
      messageDiv.style.transform = 'translateY(10px)';
    }
    
    chatMessages.appendChild(messageDiv);
    
    // 入场动画
    if (isTyping) {
      setTimeout(() => {
        messageDiv.style.transition = 'all 0.3s ease';
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
      }, 100);
    }
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
  }

  // チャット画面にエラーメッセージを表示する関数
  function showChatError(message) {
    if (chatMessages) {
      const errorDiv = createAnimatedMessage("❌ " + message, 'error-message');
    }
  }

  // 显示友好的AI响应消息
  function showFriendlyAIResponse(text) {
    // 分析内容决定显示什么友好消息
    let friendlyMessage = '';
    
    if (text.includes('startDate') || text.includes('endDate')) {
      friendlyMessage = '🤖 理解了！我已经分析了您的请求，为您创建了一个日程安排。请确认是否要添加到日历中。';
    } else if (text.includes('error') || text.includes('Error')) {
      friendlyMessage = '🤖 抱歉，处理您的请求时遇到了一些问题。请您再试一次。';
    } else {
      friendlyMessage = '🤖 ' + text;
    }
    
    const aiMsg = createAnimatedMessage('', 'assistant-message', true);
    
    // 等待入场动画完成后开始打字
    setTimeout(() => {
      typeWriter(aiMsg, friendlyMessage);
    }, 400);
  }

  // チャット送信処理
  if (chatForm && userInput && chatMessages) {
    chatForm.onsubmit = (e) => {
      e.preventDefault();
      const text = userInput.value.trim();
      if (!text) return;

      // 用户消息动画
      const userMsg = createAnimatedMessage("👤 " + text, 'user-message');

      const apiUrl = localStorage.getItem('openai_api_url') || 'https://openrouter.ai/api/v1/chat/completions';
      const apiKey = localStorage.getItem('openai_api_key') || '';
      const modelName = localStorage.getItem('openai_model') || 'deepseek/deepseek-r1-0528:free';

      const todayStr = new Date().toISOString().slice(0, 10);

      // 显示思考中的状态
      const thinkingMsg = createAnimatedMessage('🤖 思考中...', 'assistant-message thinking-message', true);

      const requestBody = {
        model: modelName,
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
      };

      logAI({ url: apiUrl, body: requestBody });

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      };

      // OpenRouter推奨ヘッダー
      if (apiUrl.includes('openrouter.ai')) {
        headers['HTTP-Referer'] = window.location.origin;
        headers['X-Title'] = 'Calendar Assistant';
      }

      fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      })
      .then(async res => {
        // 移除思考中的消息
        if (thinkingMsg.parentNode) {
          thinkingMsg.parentNode.removeChild(thinkingMsg);
        }

        const status = res.status;
        let data;
        try {
          data = await res.json();
        } catch (e) {
          throw new Error(`レスポンスJSON解析失敗: ${e.message}`);
        }
        logAI({ status, data });

        if (!res.ok) {
          const errMsg = `API Error ${status}: ${data.error?.message || res.statusText}`;
          // 404 通常意味着模型名或权限错误，给出提示
          if (status === 404) {
            showChatError('モデルが利用できません。OpenRouterで利用可能なモデル（例: deepseek/deepseek-r1-0528:free, openai/gpt-3.5-turbo）をAPI設定で選択してください。');
          } else {
            showChatError(`API Error ${status}: ${data.error?.message || res.statusText}`);
          }
          throw new Error(errMsg);
        }

        const content = data.choices?.[0]?.message?.content;
        
        // 显示友好的AI响应
        showFriendlyAIResponse(content);

        try {
          // JSON解析前，先清理AI回答中的多余文本
          let jsonStr = content.trim();
          
          // 找到JSON部分（以{开头，}结尾）
          const startIdx = jsonStr.indexOf('{');
          const endIdx = jsonStr.lastIndexOf('}');
          
          if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            jsonStr = jsonStr.substring(startIdx, endIdx + 1);
          }
          
          const eventObj = JSON.parse(jsonStr);
          
          // null値の処理と必須フィールドのチェック
          const cleanEvent = {
            startDate: eventObj.startDate || new Date().toISOString().slice(0, 10),
            endDate: eventObj.endDate || eventObj.startDate || new Date().toISOString().slice(0, 10),
            time: eventObj.time || '09:00',
            location: eventObj.location || '未設定',
            note: eventObj.note || '予定',
            color: eventObj.color || '#1a73e8'
          };
          
          logAI('解析成功したイベント: ' + JSON.stringify(cleanEvent));
          
          showEventConfirm(cleanEvent, (confirmedEvent) => {
            if (typeof window.onChatConfirmed === 'function') {
              window.onChatConfirmed(confirmedEvent);
            }
          });
        } catch (parseError) {
          logAI('JSON parse failed-> ' + content + ' Error: ' + parseError.message, 'error');
          showChatError('AIの返答を予定として解析できませんでした。もう一度お試しください。');
        }
      })
      .catch(err => {
        // 移除思考中的消息
        if (thinkingMsg.parentNode) {
          thinkingMsg.parentNode.removeChild(thinkingMsg);
        }
        logAI(err.message, 'error');
        showChatError('通信エラーが発生しました。API設定を確認してください。');
      });

      userInput.value = '';
    };
  }
}
