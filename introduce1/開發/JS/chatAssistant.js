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

  // 发送聊天消息的核心函数（チャットメッセージを送信するコア関数）
  async function sendChatMessage(messageText) {
    const text = messageText || userInput.value.trim();
    if (!text) return;

         // 如果不是自动调用，显示用户消息（自動呼び出しでない場合、ユーザーメッセージを表示）
     if (!messageText) {
       createAnimatedMessage("👤 " + text, 'user-message');
     }

    // === 重要：AI处理前先刷新本地事件数据 ===
    try {
      const userUId = localStorage.getItem("userUId");
      console.log('【AI调试】当前userUId:', userUId); // 新增log
      if (userUId) {
        console.log('🔄 刷新本地事件数据...');
        const freshEvents = await loadEvents(userUId);
        console.log('【AI调试】loadEvents返回:', freshEvents); // 新增log
        setEvents(freshEvents);
        console.log('✅ 本地事件数据已刷新，共', freshEvents.length, '个事件');
      }
    } catch (error) {
      console.warn('⚠️ 刷新事件数据失败:', error);
    }
    // === END ===

    const apiUrl = localStorage.getItem('openai_api_url') || 'https://openrouter.ai/api/v1/chat/completions';
    const apiKey = localStorage.getItem('openai_api_key') || '';
    const modelName = localStorage.getItem('openai_model') || 'deepseek/deepseek-r1-0528:free';

    const todayStr = new Date().toISOString().slice(0, 10);

    // === 优化事件列表，详细列出ID、名称、备注、时间、地点 ===
    function extractDateFromText(text) {
      // 优先匹配完整日期
      const m1 = text.match(/(\d{4}-\d{2}-\d{2})/);
      if (m1) return m1[1];
      // 匹配“15号”或“15日”
      const m2 = text.match(/(\d{1,2})[号日]/);
      if (m2) {
        const now = new Date();
        let year = now.getFullYear();
        let month = now.getMonth() + 1;
        let day = parseInt(m2[1], 10);
        if (day > now.getDate()) {
          // 本月
        } else {
          // 下个月
          month += 1;
          if (month > 12) {
            month = 1;
            year += 1;
          }
        }
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }
      // 支持“明天”“后天”
      if (/明天/.test(text)) {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().slice(0, 10);
      }
      if (/后天|後天/.test(text)) {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        return d.toISOString().slice(0, 10);
      }
      // 支持日文"明日""明後日"
      if (/明日/.test(text)) {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().slice(0, 10);
      }
      if (/明後日/.test(text)) {
        const d = new Date();
        d.setDate(d.getDate() + 2);
        return d.toISOString().slice(0, 10);
      }
      // 支持"今日""昨日"
      if (/今日/.test(text)) {
        const d = new Date();
        return d.toISOString().slice(0, 10);
      }
      if (/昨日/.test(text)) {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        return d.toISOString().slice(0, 10);
      }
      return null;
    }
    const userInputText = userInput.value.trim();
    const targetDate = extractDateFromText(userInputText);
    let eventsContext = '';
    // === 详细的调试日志 ===
    console.log('🔍 === AI处理开始 ===');
    console.log('📝 用户输入:', userInputText);
    console.log('📅 目标日期:', targetDate || '❌ 未识别');
    
    if (targetDate) {
      const dayEvents = getEvents().filter(ev => ev.startDate === targetDate);
      console.log('📋 全部事件数量:', getEvents().length);
      console.log('🎯 目标日期事件数量:', dayEvents.length);
      
      if (dayEvents.length > 0) {
        console.log('📋 目标日期事件详情:');
        dayEvents.forEach((ev, index) => {
          console.log(`   ${index + 1}. ID: ${ev._id}, 名称: "${ev.eventName}", 时间: ${ev.startTime || '无'}, 地点: ${ev.location || '无'}, 备注: "${ev.note || '无'}"`);
        });
      } else {
        console.log('⚠️  目标日期无事件');
      }
      
      eventsContext = dayEvents.length > 0
        ? '\n该日事件列表：\n' + dayEvents.map(ev => `ID: ${ev._id}, 名称: ${ev.eventName}, 备注: ${ev.note}, 时间: ${ev.startTime || ''}, 地点: ${ev.location || ''}`).join('\n')
        : '\n该日没有事件。';
    } else {
      console.log('❌ 日期识别失败 - 可能原因:');
      console.log('   - 输入格式不支持 (如: "後天" 需要支持繁体)');
      console.log('   - 日期关键词未添加 (如: "明後日" 需要添加日文支持)');
      console.log('   - 输入内容不包含日期信息');
      eventsContext = '\n未能识别日期，无法提供事件列表。';
    }
    
    console.log('📤 发送给AI的事件上下文:', eventsContext);
    console.log('🔍 === AI处理开始 ===');
    // === END ===

    // === 优化prompt，指令更明确 ===
    const aiLang = localStorage.getItem('calendarLang') || 'zh';
    const aiDeleteTip = {
      zh: '\n删除规则：用户说"不去了/取消/やっぱり"且有事件→{"action":"delete_event","_id":"事件ID"}。修改规则：用户说"改成/下午四点"且有事件→{"action":"update_event","_id":"事件ID","startTime":"16:00"}。无事件才返回{}。',
      ja: '\n削除ルール：「行かない/キャンセル/やっぱり」+イベントあり→{"action":"delete_event","_id":"イベントID"}。変更ルール：「午後4時/16時」+イベントあり→{"action":"update_event","_id":"イベントID","startTime":"16:00"}。イベントなしのみ{}。',
      en: '\nDelete rule: "not going/cancel/やっぱり"+events→{"action":"delete_event","_id":"eventID"}. Update rule: "4pm/afternoon"+events→{"action":"update_event","_id":"eventID","startTime":"16:00"}. Only {} if no events.'
    }[aiLang] || '';
    // === END ===

    // 显示思考中的状态(思考中のステータスを表示)
    const thinkingMsg = createAnimatedMessage(getLocalizedText('thinkingMessage'), 'assistant-message thinking-message', true);

    // 根据当前语言获取系统提示（現在の言語に応じたシステムプロンプトを取得）
    const systemPrompt = getLocalizedText('aiSystemPrompt', { todayStr }) + eventsContext + aiDeleteTip + '\n';
    console.log('🤖 发送给AI的完整prompt:', systemPrompt);

    const requestBody = {
      model: modelName,
      messages: [
        {
          role: 'system',
          content: systemPrompt
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

      // 移除思考中的消息（思考中メッセージを削除）
      if (thinkingMsg.parentNode) {
        thinkingMsg.parentNode.removeChild(thinkingMsg);
      }

      const data = await response.json();
      logAI({ status: response.status, data });

      if (!response.ok) {
        const errMsg = `API Error ${response.status}: ${data.error?.message || response.statusText}`;
        console.log('❌ API请求失败:', response.status, data.error?.message || response.statusText);
        
        if (response.status === 400) {
          showChatError('API请求格式错误。请尝试更换模型或检查API设置。建议使用: openai/gpt-3.5-turbo');
        } else if (response.status === 404) {
          showChatError('モデルが利用できません。OpenRouterで利用可能なモデル（例: openai/gpt-3.5-turbo）をAPI設定で選択してください。');
        } else if (response.status === 429) {
          showChatError('API请求过于频繁，请稍后再试。');
        } else {
          showChatError(`API Error ${response.status}: ${data.error?.message || response.statusText}`);
        }
        throw new Error(errMsg);
      }

      const content = data.choices?.[0]?.message?.content;
      
      console.log('🤖 === AI响应解析开始 ===');
      console.log('📥 AI原始响应:', content);
      
      // 显示友好的AI响应（親しみやすいAI応答を表示）
      showFriendlyAIResponse(content);

      try {
        // JSON解析前，先清理AI回答中的多余文本（JSONを解析する前に、AIの回答から余分なテキストをクリーンアップ）
        let jsonStr = content.trim();
        
        console.log('🧹 JSON清理前:', jsonStr);
        
        // 移除思考过程（<think>标签内容）
        const beforeThink = jsonStr;
        jsonStr = jsonStr.replace(/<think>[\s\S]*?<\/think>/g, '');
        if (beforeThink !== jsonStr) {
          console.log('🧹 已移除<think>标签内容');
        }
        
        // 移除markdown代码块
        const beforeMarkdown = jsonStr;
        jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        if (beforeMarkdown !== jsonStr) {
          console.log('🧹 已移除markdown代码块');
        }
        
        // 移除可能的解释文本（在JSON之前或之后）
        const lines = jsonStr.split('\n');
        const jsonLines = [];
        let inJson = false;
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('{') || inJson) {
            inJson = true;
            jsonLines.push(line);
            if (trimmedLine.endsWith('}')) {
              break;
            }
          }
        }
        
        if (jsonLines.length > 0) {
          jsonStr = jsonLines.join('\n');
          console.log('🧹 已提取JSON行:', jsonLines.length, '行');
        } else {
          // 如果上面的方法失败，使用原来的方法
          const startIdx = jsonStr.indexOf('{');
          const endIdx = jsonStr.lastIndexOf('}');
          
          if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            jsonStr = jsonStr.substring(startIdx, endIdx + 1);
            console.log('🧹 使用备用方法提取JSON');
          }
        }
        
        // 清理可能的尾随文本
        jsonStr = jsonStr.trim();
        if (jsonStr.includes('}')) {
          const lastBraceIndex = jsonStr.lastIndexOf('}');
          jsonStr = jsonStr.substring(0, lastBraceIndex + 1);
        }
        
        console.log('🧹 JSON清理后:', jsonStr);
        
        const eventObj = JSON.parse(jsonStr);
        
        // 检查是否为空JSON
        if (Object.keys(eventObj).length === 0) {
          console.log('⚠️  AI返回空JSON，可能是删除操作但AI未识别');
          
          // 智能删除逻辑：如果用户输入包含删除关键词且有目标日期事件，自动删除
          const deleteKeywords = ['やっぱり', 'いかない', '行かない', 'キャンセル', '削除', 'やめ', '不去了', '取消', '删除'];
          const hasDeleteIntent = deleteKeywords.some(keyword => userInputText.includes(keyword));
          
          if (hasDeleteIntent && targetDate) {
            const dayEvents = getEvents().filter(ev => ev.startDate === targetDate);
            if (dayEvents.length > 0) {
              console.log('🤖 检测到删除意图，自动删除第一个事件');
              const eventToDelete = dayEvents[0];
              const userUId = localStorage.getItem("userUId");
              
              // 显示删除确认弹窗
              showDeleteEventConfirm(eventToDelete, async (confirmedEvent) => {
                try {
                  await deleteEvent(userUId, eventToDelete._id);
                  await refreshCalendar();
                  createAnimatedMessage(`🗑 已删除事件: ${eventToDelete.eventName}`, 'assistant-message');
                  console.log('✅ 智能删除成功');
                } catch (error) {
                  console.log('❌ 智能删除失败:', error);
                  createAnimatedMessage('🤔 AI未能理解您的意图，请尝试更明确的表达', 'assistant-message');
                }
              });
              return;
            }
          }
          
          console.log('💡 建议检查：');
          console.log('   - 删除关键词是否被正确识别');
          console.log('   - AI模型是否理解删除指令');
          console.log('   - 事件ID是否正确传递');
          
          // 如果是空JSON，不执行任何操作
          createAnimatedMessage('🤔 AI未能理解您的意图，请尝试更明确的表达', 'assistant-message');
          return;
        }
        
        const action = eventObj.action || 'add_event';
        const userUId = localStorage.getItem("userUId");
        
        console.log('✅ JSON解析成功');
        console.log('🎯 操作类型:', action);
        console.log('📋 解析后的事件对象:', eventObj);
        if (action === 'add_event') {
          const cleanEvent = {
            eventName: eventObj.eventName || eventObj.note || '予定',
            startDate: targetDate || eventObj.startDate || new Date().toISOString().slice(0, 10),
            endDate: targetDate || eventObj.endDate || eventObj.startDate || new Date().toISOString().slice(0, 10),
            startTime: eventObj.startTime || eventObj.time || '09:00',
            endTime: eventObj.endTime || eventObj.time || '09:00',
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
        } else if (action === 'update_event') {
          if (!eventObj._id) {
            showChatError('事件ID缺失，无法修改。');
            return;
          }
          
          // 查找原始事件
          const originalEvent = getEvents().find(ev => ev._id === eventObj._id);
          if (!originalEvent) {
            showChatError('找不到要修改的事件。');
            return;
          }
          
          const cleanEvent = {
            _id: eventObj._id,
            eventName: eventObj.eventName || originalEvent.eventName || '予定',
            startDate: eventObj.startDate || originalEvent.startDate || new Date().toISOString().slice(0, 10),
            endDate: eventObj.endDate || eventObj.startDate || originalEvent.endDate || originalEvent.startDate || new Date().toISOString().slice(0, 10),
            startTime: eventObj.startTime || eventObj.time || originalEvent.startTime || '09:00',
            endTime: eventObj.endTime || eventObj.time || originalEvent.endTime || '09:00',
            location: eventObj.location || originalEvent.location || '未設定',
            note: eventObj.note || originalEvent.note || '予定',
            color: eventObj.color || originalEvent.color || '#1a73e8'
          };
          
          logAI('解析成功したイベント: ' + JSON.stringify(cleanEvent));
          
          // 显示修改确认弹窗
          showUpdateEventConfirm(originalEvent, cleanEvent, async (confirmedEvent) => {
            try {
              await updateEvent(userUId, eventObj._id, confirmedEvent);
              await refreshCalendar();
              createAnimatedMessage('✅ 事件已修改', 'assistant-message');
            } catch (error) {
              showChatError('事件修改失败: ' + error.message);
            }
          });
        } else if (action === 'delete_event') {
          if (!eventObj._id) {
            showChatError('事件ID缺失，无法删除。');
            return;
          }
          
          // 查找要删除的事件
          const eventToDelete = getEvents().find(ev => ev._id === eventObj._id);
          if (!eventToDelete) {
            showChatError('找不到要删除的事件。');
            return;
          }
          
          // 显示删除确认弹窗
          showDeleteEventConfirm(eventToDelete, async (confirmedEvent) => {
            try {
              await deleteEvent(userUId, eventObj._id);
              await refreshCalendar();
              createAnimatedMessage('🗑 事件已删除', 'assistant-message');
            } catch (error) {
              showChatError('事件删除失败: ' + error.message);
            }
          });
        }
        
        // 清理图片预览（如果有）（画像プレビューをクリア（もしあれば））
        if (currentImageFile) {
          setTimeout(() => hideImagePreview(), 2000);
        }
        
        console.log('✅ === AI处理完成 ===');
        console.log('🎯 最终操作:', action);
        console.log('📅 使用日期:', targetDate || 'AI默认日期');
        console.log('⏰ 处理时间:', new Date().toLocaleTimeString());

      } catch (parseError) {
        console.log('❌ === JSON解析失败 ===');
        console.log('🔍 失败原因:', parseError.message);
        console.log('📥 原始内容:', content);
        console.log('🧹 清理后内容:', jsonStr);
        console.log('💡 建议检查:');
        console.log('   - AI是否输出了非JSON格式的内容');
        console.log('   - 是否包含<think>标签或其他格式');
        console.log('   - JSON语法是否正确');
        
        logAI('JSON parse failed-> ' + content + ' Error: ' + parseError.message, 'error');
        showChatError('AIの返答を予定として解析できませんでした。もう一度お試しください。');
      }
    } catch (err) {
      // 移除思考中的消息（思考中メッセージを削除）
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
