import { showEventConfirm } from './eventModal.js';

export function initChatAssistant({ micBtnId, inputId, chatFormId, messagesId }) {
  const micBtn = document.getElementById(micBtnId);
  const userInput = document.getElementById(inputId);
  const chatForm = document.getElementById(chatFormId);
  const chatMessages = document.getElementById(messagesId);
  
  // 图片上传相关元素
  const imageBtn = document.getElementById('imageBtn');
  const imageInput = document.getElementById('imageInput');
  const imageDropZone = document.getElementById('imageDropZone');
  const imagePreview = document.getElementById('imagePreview');
  const previewImg = document.getElementById('previewImg');
  const removeImageBtn = document.getElementById('removeImage');
  const ocrStatusText = document.getElementById('ocrStatusText');
  const ocrProgress = document.getElementById('ocrProgress');
  const sendBtn = document.getElementById('sendBtn');

  // 当前上传的图片文件
  let currentImageFile = null;
  let extractedText = '';

  // 检查并显示按钮状态
  setTimeout(() => {
    console.log('🔍 聊天按钮检查:');
    console.log('- 图片按钮:', imageBtn ? '✅ 找到' : '❌ 未找到');
    console.log('- 麦克风按钮:', micBtn ? '✅ 找到' : '❌ 未找到');
    console.log('- 发送按钮:', sendBtn ? '✅ 找到' : '❌ 未找到');
    
    // 修正发送按钮文本
    if (sendBtn && sendBtn.textContent.includes('"send"')) {
      sendBtn.textContent = '发送';
    }
    
    // 确保按钮可见
    if (imageBtn) {
      imageBtn.style.visibility = 'visible';
      imageBtn.style.opacity = '1';
    }
    if (micBtn) {
      micBtn.style.visibility = 'visible';
      micBtn.style.opacity = '1';
    }
    
    // 动态添加粘贴提示
    const inputGroup = document.querySelector('#chatForm .input-group');
    if (inputGroup && !document.getElementById('pasteHint')) {
      const pasteHint = document.createElement('div');
      pasteHint.id = 'pasteHint';
      pasteHint.className = 'paste-hint';
      pasteHint.textContent = 'Ctrl+V 粘贴图片';
      inputGroup.appendChild(pasteHint);
      
      // 添加动态显示逻辑
      let showHintTimeout;
      
             // 键盘事件监听
       document.addEventListener('keydown', (e) => {
         // Ctrl+V 粘贴时显示提示
         if ((e.ctrlKey || e.metaKey) && e.key === 'v' && chatWindow && !chatWindow.classList.contains('hidden')) {
           pasteHint.classList.add('show');
           clearTimeout(showHintTimeout);
           showHintTimeout = setTimeout(() => {
             pasteHint.classList.remove('show');
           }, 2000);
         }
         // 按住Ctrl键时显示粘贴提示（如果聊天窗口打开）
         else if ((e.ctrlKey || e.metaKey) && !e.repeat && chatWindow && !chatWindow.classList.contains('hidden')) {
           pasteHint.classList.add('show');
           pasteHint.textContent = 'Ctrl+V 粘贴图片';
         }
       });
       
       // 松开Ctrl键时隐藏提示
       document.addEventListener('keyup', (e) => {
         if (!e.ctrlKey && !e.metaKey) {
           clearTimeout(showHintTimeout);
           showHintTimeout = setTimeout(() => {
             pasteHint.classList.remove('show');
           }, 300);
         }
       });
    }
  }, 1000);

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
    messageDiv.classList.add('message');
    
    // 处理多个类名（用空格分隔）
    if (className) {
      const classNames = className.split(' ');
      classNames.forEach(cls => {
        if (cls.trim()) {
          messageDiv.classList.add(cls.trim());
        }
      });
    }
    
    // 设置文本内容
    if (content) {
      messageDiv.textContent = content;
    }
    
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
      createAnimatedMessage("❌ " + message, 'error-message');
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

  // 检查文件大小
  function checkFileSize(file) {
    const maxSize = 1024 * 1024; // 1MB in bytes
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      showChatError(`图片文件过大（${sizeMB}MB），请上传小于1MB的图片。建议压缩后重新上传。`);
      return false;
    }
    return true;
  }

  // 图片压缩函数
  function compressImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = function() {
        // 计算压缩后的尺寸
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制压缩后的图片
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为Blob
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // 图片上传相关函数
  async function showImagePreview(file) {
    // 检查文件大小
    if (!checkFileSize(file)) {
      return;
    }

    // 显示压缩提示
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    let processedFile = file;
    
    // 如果文件大于500KB，建议压缩
    if (file.size > 512 * 1024) {
      createAnimatedMessage(`📷 图片大小: ${fileSizeMB}MB，正在优化以提升识别速度...`, 'assistant-message');
      
      try {
        processedFile = await compressImage(file);
        const compressedSizeMB = (processedFile.size / (1024 * 1024)).toFixed(2);
        createAnimatedMessage(`✅ 图片已优化: ${fileSizeMB}MB → ${compressedSizeMB}MB`, 'assistant-message');
      } catch (error) {
        console.warn('图片压缩失败，使用原始文件:', error);
      }
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      previewImg.src = e.target.result;
      imagePreview.classList.remove('hidden');
      imageDropZone.classList.add('hidden');
      
      // 更新状态
      ocrStatusText.textContent = '准备识别图片中的文字...';
      ocrProgress.classList.add('hidden');
      
      // 自动开始OCR识别
      setTimeout(() => performOCR(processedFile), 1000);
    };
    reader.readAsDataURL(processedFile);
  }

  function hideImagePreview() {
    imagePreview.classList.add('hidden');
    imageDropZone.classList.add('hidden');
    currentImageFile = null;
    extractedText = '';
    sendBtn.classList.remove('has-image');
    userInput.value = '';
  }

  // OCR识别函数
  async function performOCR(file) {
    try {
      // 显示进度
      ocrStatusText.textContent = '正在识别图片中的文字...';
      ocrProgress.classList.remove('hidden');
      
      // 添加进度动画
      const progressBar = ocrProgress.querySelector('.progress-bar');
      progressBar.style.width = '30%';
      
      // 准备表单数据
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', 'chs'); // 中文简体
      formData.append('isOverlayRequired', 'false');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      
      // 获取API Key (用户需要在设置中配置)
      const ocrApiKey = localStorage.getItem('ocr_api_key') || 'K87899142788957'; // 免费key，有限制
      
      progressBar.style.width = '60%';
      
      const response = await fetch('https://api.ocr.space/parse/image', {
        method: 'POST',
        headers: {
          'apikey': ocrApiKey
        },
        body: formData
      });
      
      progressBar.style.width = '90%';
      
      const result = await response.json();
      
      if (result.IsErroredOnProcessing) {
        throw new Error(result.ErrorMessage?.[0] || 'OCR处理失败');
      }
      
      // 提取文字
      const parsedText = result.ParsedResults?.[0]?.ParsedText || '';
      
      if (parsedText.trim()) {
        extractedText = parsedText.trim();
        userInput.value = `图片识别内容：${extractedText}`;
        sendBtn.classList.add('has-image');
        
        // 成功状态
        ocrStatusText.textContent = `✅ 识别成功！提取到 ${extractedText.length} 个字符`;
        progressBar.style.width = '100%';
        
        // 显示识别结果消息
        createAnimatedMessage(`📷 图片识别结果：${extractedText}`, 'user-message');
        
        // 自动提交给AI
        setTimeout(() => {
          sendChatMessage(`请根据以下图片识别的内容创建日程：${extractedText}`);
        }, 1500);
        
      } else {
        throw new Error('未能从图片中识别到文字内容');
      }
      
    } catch (error) {
      console.error('OCR Error:', error);
      ocrStatusText.textContent = `❌ 识别失败：${error.message}`;
      ocrProgress.classList.add('hidden');
      showChatError(`图片识别失败：${error.message}`);
    }
  }

  // 发送聊天消息的核心函数
  async function sendChatMessage(messageText) {
    const text = messageText || userInput.value.trim();
    if (!text) return;

         // 如果不是自动调用，显示用户消息
     if (!messageText) {
       createAnimatedMessage("👤 " + text, 'user-message');
     }

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

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestBody)
      });

      // 移除思考中的消息
      if (thinkingMsg.parentNode) {
        thinkingMsg.parentNode.removeChild(thinkingMsg);
      }

      const data = await response.json();
      logAI({ status: response.status, data });

      if (!response.ok) {
        const errMsg = `API Error ${response.status}: ${data.error?.message || response.statusText}`;
        if (response.status === 404) {
          showChatError('モデルが利用できません。OpenRouterで利用可能なモデル（例: deepseek/deepseek-r1-0528:free, openai/gpt-3.5-turbo）をAPI設定で選択してください。');
        } else {
          showChatError(`API Error ${response.status}: ${data.error?.message || response.statusText}`);
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

        // 清理图片预览（如果有）
        if (currentImageFile) {
          setTimeout(() => hideImagePreview(), 2000);
        }

      } catch (parseError) {
        logAI('JSON parse failed-> ' + content + ' Error: ' + parseError.message, 'error');
        showChatError('AIの返答を予定として解析できませんでした。もう一度お試しください。');
      }
    } catch (err) {
      // 移除思考中的消息
      if (thinkingMsg.parentNode) {
        thinkingMsg.parentNode.removeChild(thinkingMsg);
      }
      logAI(err.message, 'error');
      showChatError('通信エラーが発生しました。API設定を確認してください。');
    }

    if (!messageText) {
      userInput.value = '';
    }
  }

  // 剪贴板粘贴图片功能
  function handleClipboardPaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;

    let hasImage = false;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // 检查是否为图片
      if (item.type.startsWith('image/')) {
        e.preventDefault(); // 阻止默认粘贴行为
        hasImage = true;
        
        const file = item.getAsFile();
        if (file) {
          // 显示粘贴提示
          createAnimatedMessage('📋 检测到剪贴板图片，正在处理...', 'assistant-message');
          
          currentImageFile = file;
          showImagePreview(file);
          
          // 首次使用提示
          if (!localStorage.getItem('clipboard_tip_shown')) {
            setTimeout(() => {
              createAnimatedMessage('💡 小贴士：您可以随时使用 Ctrl+V 快速粘贴截图或复制的图片！', 'assistant-message');
              localStorage.setItem('clipboard_tip_shown', 'true');
            }, 2000);
          }
        }
        break; // 只处理第一张图片
      }
    }
    
    // 如果粘贴的不是图片，且光标不在输入框中，给出提示
    if (!hasImage && e.target !== userInput) {
      const hasText = Array.from(items).some(item => item.type === 'text/plain');
      if (!hasText) {
        createAnimatedMessage('📋 剪贴板中没有检测到图片，请复制图片后再试', 'assistant-message');
      }
    }
  }

  // 为聊天窗口添加粘贴监听器
  if (chatWindow) {
    chatWindow.addEventListener('paste', handleClipboardPaste);
  }

  // 为整个文档添加粘贴监听器（当聊天窗口打开时）
  let pasteListenerAdded = false;
  
  function addGlobalPasteListener() {
    if (!pasteListenerAdded) {
      document.addEventListener('paste', (e) => {
        // 只在聊天窗口打开时处理粘贴
        if (chatWindow && !chatWindow.classList.contains('hidden')) {
          handleClipboardPaste(e);
        }
      });
      pasteListenerAdded = true;
    }
  }

  // 事件监听器设置
  
  // 图片上传按钮点击
  if (imageBtn && imageInput) {
    imageBtn.addEventListener('click', () => {
      imageInput.click();
    });

    imageInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file && file.type.startsWith('image/')) {
        currentImageFile = file;
        showImagePreview(file);
      } else if (file) {
        showChatError('请上传图片文件（JPG、PNG、GIF格式）');
      }
      // 清空input，允许重复选择同一文件
      e.target.value = '';
    });
  }

  // 拖拽功能
  if (imageDropZone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      imageDropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
      imageDropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      imageDropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
      imageDropZone.classList.add('drag-over');
    }

    function unhighlight(e) {
      imageDropZone.classList.remove('drag-over');
    }

    imageDropZone.addEventListener('drop', handleDrop, false);
    imageDropZone.addEventListener('click', () => {
      imageInput.click();
    });

    function handleDrop(e) {
      const dt = e.dataTransfer;
      const files = dt.files;
      
      if (files.length > 1) {
        showChatError('一次只能上传一张图片');
        return;
      }
      
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
          currentImageFile = file;
          showImagePreview(file);
        } else {
          showChatError('请上传图片文件（JPG、PNG、GIF格式）');
        }
      }
    }
  }

  // 移除图片按钮
  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', hideImagePreview);
  }

  // 聊天窗口显示时显示拖拽区域和激活粘贴功能
  if (chatWindow && imageDropZone) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (!chatWindow.classList.contains('hidden')) {
            // 聊天窗口打开时
            // 1. 显示拖拽区域
            if (!currentImageFile && !imagePreview.classList.contains('hidden') === false) {
              imageDropZone.classList.remove('hidden');
            }
            // 2. 激活全局粘贴监听器
            addGlobalPasteListener();
            
            // 3. 首次使用引导（只显示一次）
            if (!localStorage.getItem('chat_features_intro_shown')) {
              setTimeout(() => {
                createAnimatedMessage('🎉 欢迎使用智能日程助手！', 'assistant-message');
                setTimeout(() => {
                  createAnimatedMessage('💡 支持三种方式添加日程：\n📝 文字输入 • 🎤 语音输入 • 📷 图片识别', 'assistant-message');
                  setTimeout(() => {
                    createAnimatedMessage('⚡ 小贴士：复制图片后按 Ctrl+V 可快速粘贴识别！', 'assistant-message');
                    localStorage.setItem('chat_features_intro_shown', 'true');
                  }, 1500);
                }, 1200);
              }, 800);
            }
          } else {
            // 聊天窗口关闭时隐藏所有图片相关界面
            imageDropZone.classList.add('hidden');
            hideImagePreview();
          }
        }
      });
    });
    
    observer.observe(chatWindow, { attributes: true });
  }

  // チャット送信处理
  if (chatForm && userInput && chatMessages) {
    chatForm.onsubmit = (e) => {
      e.preventDefault();
      try {
        sendChatMessage();
      } catch (error) {
        console.error('聊天发送错误:', error);
        showChatError('发送消息时出现错误，请重试');
      }
    };
  }
}
