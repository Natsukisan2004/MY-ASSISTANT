import { showEventConfirm, showUpdateEventConfirm, showDeleteEventConfirm } from './eventModal.js';
import { texts } from './lang.js';
import { updateEvent, deleteEvent, loadEvents } from './eventStorage.js';
import { setEvents, getEvents } from './calendar.js';
import { refreshCalendar } from './main.js';

export function initChatAssistant({ micBtnId, inputId, chatFormId, messagesId }) {
  const micBtn = document.getElementById(micBtnId);
  const userInput = document.getElementById(inputId);
  const chatForm = document.getElementById(chatFormId);
  const chatMessages = document.getElementById(messagesId);
  
  // 图片上传相关元素(画像アップロード関連の要素)
  const imageBtn = document.getElementById('imageBtn');
  const imageInput = document.getElementById('imageInput');
  const imageDropZone = document.getElementById('imageDropZone');
  const imagePreview = document.getElementById('imagePreview');
  const previewImg = document.getElementById('previewImg');
  const removeImageBtn = document.getElementById('removeImage');
  const ocrStatusText = document.getElementById('ocrStatusText');
  const ocrProgress = document.getElementById('ocrProgress');
  const sendBtn = document.getElementById('sendBtn');

  // 当前上传的图片文件（現在アップロードされている画像ファイル）
  let currentImageFile = null;
  let extractedText = '';
  
  // 获取当前语言设置（現在の言語設定を取得）
  function getCurrentLanguage() {
    return localStorage.getItem('calendarLang') || 'ja';
  }
  
  // 获取当前语言的文本（現在の言語のテキストを取得）
  function getLocalizedText(key, params = {}) {
    const lang = getCurrentLanguage();
    let text = texts[lang]?.[key] || texts.ja[key] || key;
    
    // 替换参数（パラメータを置換）
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
  }
  
  // 更新界面中的多语言文本（UIの多言語テキストを更新）
  function updateInterfaceTexts() {
    // 更新输入框占位符(入力ボックスのプレースホルダーを更新)
    if (userInput) {
      userInput.placeholder = getLocalizedText('userInputPlaceholder');
    }
    
    // 更新粘贴提示（貼り付けヒントを更新）
    const pasteHint = document.getElementById('pasteHint');
    if (pasteHint) {
      pasteHint.textContent = getLocalizedText('pasteHint');
    }
    
    // 更新发送按钮文本(送信ボタンのテキストを更新)
    if (sendBtn) {
      sendBtn.textContent = getLocalizedText('send');
    }
    
    // 更新拖拽区域文本（ドラッグ＆ドロップエリアのテキストを更新）
    const dropZoneText = document.querySelector('.drop-zone-text');
    if (dropZoneText) {
      dropZoneText.textContent = getLocalizedText('dropZoneText');
    }
    
    const dropZoneSubtext = document.querySelector('.drop-zone-subtext');
    if (dropZoneSubtext) {
      dropZoneSubtext.textContent = getLocalizedText('dropZoneSubtext');
    }
  }
  
  // 暴露更新函数到全局，供其他模块调用（更新関数をグローバルに公開し、他のモジュールから呼び出せるようにする）
  window.updateChatLanguage = updateInterfaceTexts;

  // 检查并显示按钮状态(ボタンの状態を確認して表示)
  setTimeout(() => {
    console.log('🔍 聊天按钮检查:');
    console.log('- 图片按钮:', imageBtn ? '✅ 找到' : '❌ 未找到');
    console.log('- 麦克风按钮:', micBtn ? '✅ 找到' : '❌ 未找到');
    console.log('- 发送按钮:', sendBtn ? '✅ 找到' : '❌ 未找到');
    
    // 修正发送按钮文本和占位符(送信ボタンのテキストとプレースホルダーを修正)
    if (sendBtn && sendBtn.textContent.includes('"send"')) {
      sendBtn.textContent = getLocalizedText('send'); // 使用发送文本(送信テキストを使用)
    }
    
    // 初始化时更新所有界面文本（初期化時にすべてのUIテキストを更新）
    updateInterfaceTexts();
    
    // 确保按钮可见（ボタンが表示されるようにする）
    if (imageBtn) {
      imageBtn.style.visibility = 'visible';
      imageBtn.style.opacity = '1';
    }
    if (micBtn) {
      micBtn.style.visibility = 'visible';
      micBtn.style.opacity = '1';
    }
    
    // 动态添加粘贴提示(貼り付けヒントを動的に追加)
    const inputGroup = document.querySelector('#chatForm .input-group');
    if (inputGroup && !document.getElementById('pasteHint')) {
             const pasteHint = document.createElement('div');
       pasteHint.id = 'pasteHint';
       pasteHint.className = 'paste-hint';
       pasteHint.textContent = getLocalizedText('pasteHint');
       inputGroup.appendChild(pasteHint);
      
      // 添加动态显示逻辑(動的な表示ロジックを追加)
      let showHintTimeout;
      
             // 键盘事件监听(キーボードイベントリスナー)
       document.addEventListener('keydown', (e) => {
         // Ctrl+V 粘贴时显示提示（Ctrl+Vでの貼り付け時にヒントを表示）
         if ((e.ctrlKey || e.metaKey) && e.key === 'v' && chatWindow && !chatWindow.classList.contains('hidden')) {
           pasteHint.classList.add('show');
           clearTimeout(showHintTimeout);
           showHintTimeout = setTimeout(() => {
             pasteHint.classList.remove('show');
           }, 2000);
         }
         // 按住Ctrl键时显示粘贴提示（如果聊天窗口打开）（Ctrlキーを押している間、貼り付けヒントを表示（チャットウィンドウが開いている場合））
         else if ((e.ctrlKey || e.metaKey) && !e.repeat && chatWindow && !chatWindow.classList.contains('hidden')) {
           pasteHint.classList.add('show');
           pasteHint.textContent = getLocalizedText('pasteHint');
         }
       });
       
       // 松开Ctrl键时隐藏提示（Ctrlキーを離したときにヒントを非表示）
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

  // 音声認識設定（音声認識設定）
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

  // 打字动画效果（タイピングアニメーション効果）
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

  // 创建动画消息元素(アニメーション付きメッセージ要素を作成)
  function createAnimatedMessage(content, className, isTyping = false) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    
    // 处理多个类名（用空格分隔）（複数のクラス名を処理（スペースで区切る））
    if (className) {
      const classNames = className.split(' ');
      classNames.forEach(cls => {
        if (cls.trim()) {
          messageDiv.classList.add(cls.trim());
        }
      });
    }
    
    // 设置文本内容(テキストコンテンツを設定)
    if (content) {
      messageDiv.textContent = content;
    }
    
    if (isTyping) {
      messageDiv.style.opacity = '0';
      messageDiv.style.transform = 'translateY(10px)';
    }
    
    chatMessages.appendChild(messageDiv);
    
    // 入场动画(登場アニメーション)
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

  // 显示友好的AI响应消息（親しみやすいAI応答メッセージを表示）
  function showFriendlyAIResponse(text) {
    // 分析内容决定显示什么友好消息（内容を分析して表示するフレンドリーメッセージを決定）
    let friendlyMessage = '';
    
    if (text.includes('startDate') || text.includes('endDate')) {
      friendlyMessage = '🤖 理解了！我已经分析了您的请求，为您创建了一个日程安排。请确认是否要添加到日历中。';
    } else if (text.includes('error') || text.includes('Error')) {
      friendlyMessage = '🤖 抱歉，处理您的请求时遇到了一些问题。请您再试一次。';
    } else {
      friendlyMessage = '🤖 ' + text;
    }
    
    const aiMsg = createAnimatedMessage('', 'assistant-message', true);
    
    // 等待入场动画完成后开始打字(登場アニメーション完了後にタイピングを開始)
    setTimeout(() => {
      typeWriter(aiMsg, friendlyMessage);
    }, 400);
  }

  // 检查文件大小(ファイルサイズをチェック)
  function checkFileSize(file) {
    const maxSize = 1024 * 1024; // 1MB in bytes
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      showChatError(`图片文件过大（${sizeMB}MB），请上传小于1MB的图片。建议压缩后重新上传。`);
      return false;
    }
    return true;
  }

  // 图片压缩函数(画像圧縮関数）
  function compressImage(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = function() {
        // 计算压缩后的尺寸（圧縮後のサイズを計算）
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // 绘制压缩后的图片(圧縮後の画像を描画)
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为Blob（Blobに変換）
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  // 图片上传相关函数(画像アップロード関連の関数)
  async function showImagePreview(file) {
    // 检查文件大小(ファイルサイズをチェック)
    if (!checkFileSize(file)) {
      return;
    }

    // 显示压缩提示(圧縮のヒントを表示)
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    let processedFile = file;
    
    // 如果文件大于500KB，建议压缩（ファイルが500KBより大きい場合、圧縮を推奨）
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
      
      // 更新状态（ステータスを更新）
      ocrStatusText.textContent = '准备识别图片中的文字...';
      ocrProgress.classList.add('hidden');
      
      // 自动开始OCR识别（自動でOCR認識を開始）
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

  // OCR识别函数（OCR認識関数）
  async function performOCR(file) {
    try {
      // 显示进度(進捗を表示)
      ocrStatusText.textContent = getLocalizedText('ocrProcessing');
      ocrProgress.classList.remove('hidden');
      
      // 添加进度动画(進捗アニメーションを追加)
      const progressBar = ocrProgress.querySelector('.progress-bar');
      progressBar.style.width = '30%';
      
      // 准备表单数据（フォームデータを準備）
      const formData = new FormData();
      formData.append('file', file);
      
      // 根据当前语言设置OCR语言（現在の言語に応じてOCR言語を設定）
      const currentLang = getCurrentLanguage();
      const ocrLanguage = texts[currentLang]?.ocrLanguage || 'eng';
      formData.append('language', ocrLanguage);
      
      formData.append('isOverlayRequired', 'false');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      
      // 获取API Key (用户需要在设置中配置)（APIキーを取得（ユーザーが設定で構成する必要がある））
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
      
      // 提取文字（テキストを抽出）
      const parsedText = result.ParsedResults?.[0]?.ParsedText || '';
      
      if (parsedText.trim()) {
        extractedText = parsedText.trim();
        userInput.value = `图片识别内容：${extractedText}`;
        sendBtn.classList.add('has-image');
        
        // 成功状态（成功ステータス）
        ocrStatusText.textContent = getLocalizedText('ocrSuccess', { count: extractedText.length });
        progressBar.style.width = '100%';
        
        // 显示识别结果消息(認識結果メッセージを表示)
        createAnimatedMessage(getLocalizedText('ocrResult', { text: extractedText }), 'user-message');
        
        // 自动提交给AI（自動でAIに送信）
        setTimeout(() => {
          sendChatMessage(getLocalizedText('ocrToAiPrompt', { text: extractedText }));
        }, 1500);
        
      } else {
        throw new Error('未能从图片中识别到文字内容');
      }
      
    } catch (error) {
      console.error('OCR Error:', error);
      ocrStatusText.textContent = getLocalizedText('ocrFailed', { error: error.message });
      ocrProgress.classList.add('hidden');
      showChatError(getLocalizedText('ocrFailed', { error: error.message }));
    }
  }

    function extractDateFromText(text) {
    // YYYY-MM-DD形式の完全な日付を最優先で照合
    const m1 = text.match(/(\d{4}-\d{2}-\d{2})/);
    if (m1) return m1[1];
    
    // 「15号」や「15日」といった形式を照合
    const m2 = text.match(/(\d{1,2})[号日]/);
    if (m2) {
      const now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth() + 1;
      let day = parseInt(m2[1], 10);
      
      // もし指定された日が今日より前なら、来月のことだと解釈
      if (day < now.getDate()) {
        month += 1;
        if (month > 12) {
          month = 1;
          year += 1;
        }
      }
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    
    // 「明日」「あした」などを照合
    if (/明日|あした|tomorrow/.test(text)) {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d.toISOString().slice(0, 10);
    }
    
    // 「明後日」「あさって」などを照合
    if (/明後日|あさって|the day after tomorrow/.test(text)) {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      return d.toISOString().slice(0, 10);
    }

    // 「今日」「きょう」などを照合
    if (/今日|きょう|today/.test(text)) {
      return new Date().toISOString().slice(0, 10);
    }
    
    return null; // 日付が見つからなければnullを返す
  }


  async function sendChatMessage(messageText) {
    const text = messageText || userInput.value.trim();
    if (!text) return;

    // 添加防重复处理机制
    if (window.__isProcessingChatMessage) {
      console.log('🔍 [调试] 正在处理中，跳过重复请求');
      return;
    }
    window.__isProcessingChatMessage = true;

    try {
      if (!messageText) {
        createAnimatedMessage("👤 " + text, 'user-message');
      }

    try {
      const userUId = localStorage.getItem("userUId");
      if (userUId) {
        const freshEvents = await loadEvents(userUId);
        setEvents(freshEvents);
      }
    } catch (error) {
      console.warn('⚠️ 刷新事件数据失败:', error);
    }

    const apiUrl = localStorage.getItem('openai_api_url') || 'https://openrouter.ai/api/v1/chat/completions';
    const apiKey = localStorage.getItem('openai_api_key') || '';
    const modelName = localStorage.getItem('openai_model') || 'deepseek/deepseek-r1-0528:free';
    const todayStr = new Date().toISOString().slice(0, 10);
    const eventsContext = '...'; 
    const systemPrompt = getLocalizedText('aiSystemPrompt', { todayStr }) + eventsContext + '...';

    const requestToFunction = {
      messages: [ { role: 'system', content: systemPrompt }, { role: 'user', content: text } ],
      modelName: modelName
    };

    try {
      // デプロイしたCloud FunctionのURLを直接指定します
      const functionUrl = 'https://asia-northeast1-myassistant-90ce9.cloudfunctions.net/chatWithAI';

      // 通常のfetchで、作成したCloud Functionを呼び出します
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // onRequest関数に合わせて { data: ... } という形式でデータを送信します
        body: JSON.stringify({ data: requestToFunction }),
      });

      if (thinkingMsg.parentNode) {
        thinkingMsg.parentNode.removeChild(thinkingMsg);
      }
      
      const result = await response.json();

      if (!response.ok) {
        // サーバーからのエラーメッセージを正しく表示します
        throw new Error(result.error || '不明なサーバーエラーが発生しました。');
      }
      
      // Cloud Functionからのレスポンスは .data プロパティに入っています
      const data = result.data; 
      logAI({ status: 200, data });

      const content = data.choices?.[0]?.message?.content;

      
      // 显示友好的AI响应（親しみやすいAI応答を表示）
      showFriendlyAIResponse(content);

      ////
    try {
      let jsonStr = content.trim();
      
      const beforeThink = jsonStr;
      jsonStr = jsonStr.replace(/<think>[\s\S]*?<\/think>/g, '');
      
      const beforeMarkdown = jsonStr;
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      const startIdx = jsonStr.indexOf('{');
      const endIdx = jsonStr.lastIndexOf('}');
      
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        jsonStr = jsonStr.substring(startIdx, endIdx + 1);
      }
      ai1Result = JSON.parse(jsonStr);
      console.log('[AI1解析后]', ai1Result);
    } catch (err) {
      if (thinkingMsg.parentNode) thinkingMsg.parentNode.removeChild(thinkingMsg);
      showChatError('第一次AI解析失败，请重试。');
      return;
    }
    if (!ai1Result || !ai1Result.date) {
      showChatError('AI未能正确识别您的意图，请补充关键信息。');
      return;
    }

    // 本地查找当天所有事件
    const candidates = getEvents().filter(ev => ev.startDate === ai1Result.date);

    // === 第二次AI调用：结合候选事件做决策 ===
    logAI(`[AI2事件决策] 使用模型: ${modelName}, API: ${apiUrl}`);
    // 多语言支持
    const langMap = { zh: '中文', ja: '日语', en: '英语' };
    const userLang = getCurrentLanguage();
    const langText = langMap[userLang] || '中文';
    const ai2Prompt = `你是一个日历事件决策助手。
今天是 ${todayStr}。
以下是已提取的目标日期：
  日期：${ai1Result.date}

后端已根据这个日期查询到以下候选事件（JSON 数组；若无匹配，则数组为空）：
${JSON.stringify(candidates)}

用户原话：
“${userInputText}”

任务：
请基于用户原话和候选事件列表，判断用户意图，并决定要对指定事件执行何种操作：
- 新增（add_event）
- 修改（update_event）
- 删除（delete_event）

输出：严格返回一行 JSON 数组，元素为操作对象：
- 新增事件示例：
  {"action":"add_event","eventName":"会议","date":"2025-07-16","startTime":"14:00","endTime":"15:00","location":"地点","note":"备注"}
- 修改事件示例：
  {"action":"update_event","_id":"事件ID","startTime":"16:00","note":"新备注"}
- 删除事件示例：
  {"action":"delete_event","_id":"事件ID"}

如果不需要任何操作，则返回空数组：[]。不要任何额外文字说明或解释。

请用${langText}输出事件名、备注等内容。`;
    logAI('[AI2完整提示词]\n' + ai2Prompt);
    const ai2RequestBody = {
      model: modelName,
      messages: [
        { role: 'system', content: ai2Prompt },
        { role: 'user', content: userInputText }
      ]
    };
    const thinkingMsg2 = createAnimatedMessage(getLocalizedText('thinkingMessage'), 'assistant-message thinking-message', true);
    // 解析AI2响应
    let ai2Result;
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(ai2RequestBody)
      });
      if (thinkingMsg2.parentNode) thinkingMsg2.parentNode.removeChild(thinkingMsg2);
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      // 增强调试日志
      console.log('[AI2原始响应]', content);
      let jsonStr = content.trim();
      jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const startIdx = jsonStr.indexOf('[');
      const endIdx = jsonStr.lastIndexOf(']');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        jsonStr = jsonStr.substring(startIdx, endIdx + 1);
      }
      ai2Result = JSON.parse(jsonStr);
      console.log('[AI2解析后]', ai2Result);
    } catch (err) {
      if (thinkingMsg2.parentNode) thinkingMsg2.parentNode.removeChild(thinkingMsg2);
      showChatError('第二次AI解析失败，请重试。');
      return;
    }
    if (!ai2Result || !Array.isArray(ai2Result)) {
      showChatError('AI未返回有效操作数组。');
      return;
    }

    const userUId = localStorage.getItem("userUId");
    let hasAction = false;
    ai2Result.forEach(op => {
      if (op.action === 'add_event') {
        // 兜底：fields为空时用op自身补全
        const fields = Object.keys(op).length > 0 ? op : {};
        const newEvent = {
          eventName: fields.eventName || fields.activity || '新事件',
          startDate: fields.date || todayStr,
          endDate: fields.date || todayStr,
          startTime: fields.startTime || '09:00',
          endTime: fields.endTime || '09:00',
          location: fields.location || '未設定',
          note: fields.note || '',
          color: '#1a73e8'
        };
        showEventConfirm(newEvent, (confirmedEvent) => {
          if (typeof window.onChatConfirmed === 'function') {
            window.onChatConfirmed(confirmedEvent);
          }
        });
        hasAction = true;
      } else if (op.action === 'update_event' && op._id) {
        const eventToHandle = getEvents().find(ev => ev._id === op._id);
        if (eventToHandle) {
          const cleanEvent = { ...eventToHandle, ...op };
          showUpdateEventConfirm(eventToHandle, cleanEvent, async (confirmedEvent) => {
            try {
              await updateEvent(userUId, eventToHandle._id, confirmedEvent);
              await refreshCalendar();
              createAnimatedMessage('✅ 事件已修改', 'assistant-message');
            } catch (error) {
              showChatError('事件修改失败: ' + error.message);
            }
          });
          hasAction = true;
        }
      } else if (op.action === 'delete_event' && op._id) {
        const eventToHandle = getEvents().find(ev => ev._id === op._id);
        if (eventToHandle) {
          showDeleteEventConfirm(eventToHandle, async (confirmedEvent) => {
            try {
              await deleteEvent(userUId, eventToHandle._id);
              await refreshCalendar();
              createAnimatedMessage('🗑 事件已删除', 'assistant-message');
            } catch (error) {
              showChatError('事件删除失败: ' + error.message);
            }
          });
          hasAction = true;
        }
      }
      logAI(err.message, 'error');
      showChatError('通信エラーが発生しました。API設定を確認してください。');
    }

    if (!messageText) {
      userInput.value = '';
    }
    
    // 重置处理标志
    window.__isProcessingChatMessage = false;
  }

  // 剪贴板粘贴图片功能（クリップボードからの画像貼り付け機能）
  function handleClipboardPaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;

    let hasImage = false;
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // 检查是否为图片(画像であるかチェック）
      if (item.type.startsWith('image/')) {
        e.preventDefault(); // 阻止默认粘贴行为（デフォルトの貼り付け動作を阻止）
        hasImage = true;
        
        const file = item.getAsFile();
        if (file) {
          // 显示粘贴提示(貼り付けヒントを表示）
          createAnimatedMessage(getLocalizedText('clipboardDetected'), 'assistant-message');
          
          currentImageFile = file;
          showImagePreview(file);
          
          // 首次使用提示(初回利用時のヒント)
          if (!localStorage.getItem('clipboard_tip_shown')) {
            setTimeout(() => {
              createAnimatedMessage(getLocalizedText('clipboardTip'), 'assistant-message');
              localStorage.setItem('clipboard_tip_shown', 'true');
            }, 2000);
          }
        }
        break; // 只处理第一张图片（最初の画像のみを処理）
      }
    }
    
    // 如果粘贴的不是图片，且光标不在输入框中，给出提示（貼り付けたのが画像でなく、カーソルが入力ボックスにない場合にヒントを表示）
    if (!hasImage && e.target !== userInput) {
      const hasText = Array.from(items).some(item => item.type === 'text/plain');
      if (!hasText) {
        createAnimatedMessage(getLocalizedText('clipboardNoImage'), 'assistant-message');
      }
    }
  }

  // 为聊天窗口添加粘贴监听器（チャットウィンドウに貼り付けリスナーを追加）
  // === 移除 chatWindow 上的 paste 监听器 ===
  // if (chatWindow) {
  //   chatWindow.removeEventListener('paste', handleClipboardPaste); // 防止重复绑定
  //   chatWindow.addEventListener('paste', handleClipboardPaste);
  // }

  // === 只在 document 上绑定一次 paste 监听器 ===
  if (!window.__globalPasteListenerAdded) {
    document.addEventListener('paste', (e) => {
      const chatWindow = document.getElementById('chatWindow');
      if (chatWindow && !chatWindow.classList.contains('hidden')) {
        handleClipboardPaste(e);
      }
    });
    window.__globalPasteListenerAdded = true;
  }

  // 事件监听器设置(イベントリスナー設定)
  
  // 图片上传按钮点击(画像アップロードボタンのクリック）
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
      // 清空input，允许重复选择同一文件（inputをクリアし、同じファイルの再選択を許可）
      e.target.value = '';
    });
  }

  // 拖拽功能（ドラッグ＆ドロップ機能）
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

  // 移除图片按钮（画像削除ボタン）
  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', hideImagePreview);
  }

  // 聊天窗口显示时显示拖拽区域和激活粘贴功能（チャットウィンドウ表示時にドラッグエリアを表示し、貼り付け機能を有効化）
  if (chatWindow && imageDropZone) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (!chatWindow.classList.contains('hidden')) {
            // 聊天窗口打开时（チャットウィンドウが開いたとき）
            // 1. 显示拖拽区域(1. ドラッグエリアを表示)
            if (!currentImageFile && !imagePreview.classList.contains('hidden') === false) {
              imageDropZone.classList.remove('hidden');
            }
            // 2. 激活全局粘贴监听器（2. グローバル貼り付けリスナーを有効化）
            // addGlobalPasteListener(); // この行は削除されました
            
            // 3. 首次使用引导（只显示一次）（3. 初回利用ガイダンス（一度だけ表示））
            if (!localStorage.getItem('chat_features_intro_shown')) {
              setTimeout(() => {
                createAnimatedMessage(getLocalizedText('welcomeChat'), 'assistant-message');
                setTimeout(() => {
                  createAnimatedMessage(getLocalizedText('chatFeatures'), 'assistant-message');
                  setTimeout(() => {
                    createAnimatedMessage(getLocalizedText('pasteShortcut'), 'assistant-message');
                    localStorage.setItem('chat_features_intro_shown', 'true');
                  }, 1500);
                }, 1200);
              }, 800);
            }
          } else {
            // 聊天窗口关闭时隐藏所有图片相关界面(チャットウィンドウが閉じたときに、すべての画像関連UIを非表示にする)
            imageDropZone.classList.add('hidden');
            hideImagePreview();
          }
        }
      });
    });
    
    observer.observe(chatWindow, { attributes: true });
  }

  // チャット送信处理(チャット送信処理)
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
