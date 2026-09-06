(function () {
    // منع تحميل الودجت أكثر من مرة
    if (document.getElementById("omar-chatbot-widget")) {
        return;
    }

    // 1. تحميل مكتبة FontAwesome تلقائيًا
    const fontAwesome = document.createElement("link");
    fontAwesome.rel = "stylesheet";
    fontAwesome.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    document.head.appendChild(fontAwesome);

    // 2. تحميل ملف chatbot.css
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://elesawy-chatbot.hstn.me/css/style.css";
    document.head.appendChild(css);

    // 3. إنشاء الودجت
    const widget = document.createElement("div");
    widget.id = "omar-chatbot-widget";


    // رابط شعار Omar (يمكنك استبداله برابط الصورة الخاصة بك)
    const logoUrl = "https://i.ibb.co/L8x3N40/omar-logo.png"; // استبدل الرابط بشعارك

    widget.innerHTML = `
        <button id="chatbot-toggle" aria-label="Open chatbot">
            <div class="toggle-logo-container">
                <div class="toggle-logo">E</div>
            </div>
            <span class="ai-badge">AI</span>
        </button>

        <div id="chatbot-window" class="chatbot-hidden">

            <div class="chatbot-header">
                <div class="chatbot-header-info">
                    <div class="chatbot-avatar">E</div>
                    <div>
                        <div class="chatbot-name">Omar AI</div>
                        <div class="chatbot-status">
                            <span class="status-dot"></span>
                            Personal assistant
                        </div>
                    </div>
                </div>

                <div class="chatbot-header-actions">
                    <button id="chatbot-reset" class="header-icon-btn" title="Reset Chat">
                        <i class="fa-solid fa-rotate-right"></i>
                    </button>
                    <button id="chatbot-close" class="header-icon-btn" aria-label="Close chatbot">
                        ✕
                    </button>
                </div>
            </div>

            <div id="chatbot-messages" class="chatbot-messages">
                
                <div id="chatbot-welcome-screen" class="welcome-screen">
                    <div class="center-avatar">E</div>
                    <h2>Hi, I am Omar AI</h2>
                    <p class="welcome-sub">
                        Ask about Omar Yasser, his Python automation work, scraping projects, or how he can help.
                    </p>

                    <div class="suggested-prompts">
                        <button class="prompt-btn">What does Omar specialize in?</button>
                        <button class="prompt-btn">Tell me about FPM</button>
                        <button class="prompt-btn">What services can Omar offer?</button>
                    </div>
                </div>

            </div>

            <div class="chatbot-input-area">
                <textarea
                    id="chatbot-input"
                    placeholder="Ask about Omar, projects, or services..."
                    rows="1"
                ></textarea>

                <button id="chatbot-send" aria-label="Send message">
                    <i class="fa-solid fa-paper-plane"></i>
                </button>
            </div>

        </div>
    `;

    document.body.appendChild(widget);

        // بعد سطر حقن الشات بوت في الصفحة مباشرة:
    document.body.appendChild(widgetContainer);

    // إجبار محرك المتصفح على إعادة حساب التنسيق فوراً (Force Reflow)
    void widgetContainer.offsetHeight;
    window.dispatchEvent(new Event('resize'));

    // العناصر
    const toggleButton = document.getElementById("chatbot-toggle");
    const closeButton = document.getElementById("chatbot-close");
    const resetButton = document.getElementById("chatbot-reset");
    const chatbotWindow = document.getElementById("chatbot-window");
    const input = document.getElementById("chatbot-input");
    const sendButton = document.getElementById("chatbot-send");
    const messages = document.getElementById("chatbot-messages");
    const welcomeScreen = document.getElementById("chatbot-welcome-screen");

    // فتح وإغلاق الودجت
    toggleButton.addEventListener("click", function () {
        chatbotWindow.classList.toggle("chatbot-hidden");
        if (!chatbotWindow.classList.contains("chatbot-hidden")) {
            input.focus();
        }
    });

    closeButton.addEventListener("click", function () {
        chatbotWindow.classList.add("chatbot-hidden");
    });

    // إعادة ضبط المحادثة
    resetButton.addEventListener("click", function() {
        messages.innerHTML = '';
        messages.appendChild(welcomeScreen);
        welcomeScreen.style.display = 'flex';
        bindPromptButtons();
    });

    // تفعيل ضغط أزرار الأسئلة المقترحة
    function bindPromptButtons() {
        const promptBtns = document.querySelectorAll(".prompt-btn");
        promptBtns.forEach(btn => {
            btn.addEventListener("click", function() {
                const text = this.textContent.trim();
                input.value = text;
                sendMessage();
            });
        });
    }
    bindPromptButtons();

    // إضافة رسالة
    function addMessage(text, sender) {
        // إخفاء واجهة الترحيب عند بدء المحادثة
        if (welcomeScreen && welcomeScreen.style.display !== "none") {
            welcomeScreen.style.display = "none";
        }

        const message = document.createElement("div");
        message.classList.add("message");

        if (sender === "user") {
            message.classList.add("user-message");
        } else {
            message.classList.add("bot-message");
        }

        const content = document.createElement("div");
        content.classList.add("message-content");
        content.textContent = text;

        const time = document.createElement("div");
        time.classList.add("message-time");
        time.textContent = getCurrentTime();

        message.appendChild(content);
        message.appendChild(time);

        messages.appendChild(message);
        scrollToBottom();
    }

    // Typing Indicators
    function showTyping() {
        const typing = document.createElement("div");
        typing.id = "chatbot-typing";
        typing.className = "message bot-message";
        typing.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messages.appendChild(typing);
        scrollToBottom();
    }

    function hideTyping() {
        const typing = document.getElementById("chatbot-typing");
        if (typing) {
            typing.remove();
        }
    }

    const sessionId = crypto.randomUUID();


    // إرسال الرسالة
    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, "user");

        input.value = "";
        input.style.height = "auto";
        sendButton.disabled = true;

        showTyping();

        try {
        const response = await fetch("https://bot-server-24zp.onrender.com/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
        session_id: sessionId,
        message: text })
});

            if (!response.ok) throw new Error("Server error");

            const data = await response.json();
            hideTyping();
            addMessage(data.response, "bot");

        } catch (error) {
            console.error(error);
            hideTyping();
            addMessage("حصل خطأ أثناء الاتصال بالسيرفر. حاول مرة تانية.", "bot");
        } finally {
            sendButton.disabled = false;
            input.focus();
        }
    }

    sendButton.addEventListener("click", sendMessage);

    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    });

    // تكبير الـ textarea تلقائيًا
    input.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = Math.min(this.scrollHeight, 120) + "px";
    });

    function scrollToBottom() {
        messages.scrollTop = messages.scrollHeight;
    }

    function getCurrentTime() {
        return new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }
})();

