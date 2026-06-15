// chatbot.js
(function() {
    const API_BASE = window.API_BASE_URL || 'http://localhost:4000/api';

    const chatbotHTML = `
        <div class="chatbot-widget">
            <button class="chatbot-toggle" id="chatbotToggle">
                <i data-lucide="message-circle"></i>
            </button>
            <div class="chatbot-container" id="chatbotContainer">
                <div class="chatbot-header">
                    <div class="chatbot-header-info">
                        <i data-lucide="bot"></i>
                        <span class="chatbot-header-title">Farm2Market Assistant</span>
                    </div>
                    <button class="chatbot-close" id="chatbotClose">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="chatbot-messages" id="chatbotMessages">
                    <div class="message message-ai">
                        Hello! I'm your Farm2Market assistant. How can I help you today?
                    </div>
                </div>
                <div class="chatbot-input-area">
                    <input type="text" class="chatbot-input" id="chatbotInput" placeholder="Ask anything...">
                    <button class="chatbot-send" id="chatbotSend">
                        <i data-lucide="send"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', chatbotHTML);

    const toggle = document.getElementById('chatbotToggle');
    const container = document.getElementById('chatbotContainer');
    const close = document.getElementById('chatbotClose');
    const messagesContainer = document.getElementById('chatbotMessages');
    const input = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('chatbotSend');

    let chatHistory = [];

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    toggle.addEventListener('click', () => {
        container.classList.toggle('active');
        if (container.classList.contains('active')) {
            input.focus();
        }
    });

    close.addEventListener('click', () => {
        container.classList.remove('active');
    });

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        input.value = '';

        const typingId = showTypingIndicator();

        try {
            const response = await fetch(`${API_BASE}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    history: chatHistory
                })
            });

            removeTypingIndicator(typingId);

            if (response.ok) {
                const data = await response.json();
                addMessage(data.reply, 'ai');

                chatHistory.push({ role: 'user', parts: [{ text }] });
                chatHistory.push({ role: 'model', parts: [{ text: data.reply }] });

                if (chatHistory.length > 10) chatHistory = chatHistory.slice(-10);
            } else {
                const error = await response.json();
                addMessage(`Error: ${error.error || 'Failed to connect to AI.'}`, 'ai');
            }
        } catch (err) {
            removeTypingIndicator(typingId);
            addMessage('Sorry, I am having trouble connecting to the server.', 'ai');
            console.error('Chat error:', err);
        }
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message message-${sender}`;

        if (sender === 'ai') {
            msgDiv.innerHTML = formatAIResponse(text);
        } else {
            msgDiv.textContent = text;
        }

        messagesContainer.appendChild(msgDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function showTypingIndicator() {
        const id = 'typing-' + Date.now();
        const typingDiv = document.createElement('div');
        typingDiv.id = id;
        typingDiv.className = 'message message-ai typing';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function formatAIResponse(text) {

        let formatted = text
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`(.*?)`/g, '<code>$1</code>');

        return `<p>${formatted}</p>`;
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

})();
