
import { db } from './firebase.js';
import { collection, getDocs, addDoc, doc, query, orderBy, serverTimestamp, onSnapshot, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// --- SECURITY WARNING --- //
// This API key is exposed on the client side. This is not secure.
// For production, you should use a backend server to call the Gemini API.
// Revoke this key and create a new one after development.
const GEMINI_API_KEY = 'AIzaSyAOg-GwRizftAonNqOEg37HMMqH4oNT9EM';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const userNameDisplay = document.getElementById('user-name-display');
    const premiumStatusBadge = document.getElementById('premium-status-badge');
    const chatLogoutBtn = document.getElementById('chat-logout-btn');
    const chatWindow = document.getElementById('chat-window');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');
    const chatHistoryList = document.getElementById('chat-history-list');

    // Premium Features Elements
    const ttsFeature = document.getElementById('tts-premium-feature');
    const codeFeature = document.getElementById('code-premium-feature');
    const notPremiumMessage = document.getElementById('not-premium-message');

    // --- State ---
    let userId = null;
    let userName = null;
    let isPremium = false;
    let currentChatId = null;
    let unsubscribeChat = null; // To stop listening to a chat when switching

    // --- Initialization ---
    const init = () => {
        userId = localStorage.getItem('userId');
        userName = localStorage.getItem('userName');
        isPremium = localStorage.getItem('isPremium') === 'true';

        if (!userId) {
            window.location.href = 'index.html';
            return;
        }

        // Setup UI based on user data
        userNameDisplay.textContent = userName || 'مستخدم';
        setupPremiumFeatures();
        loadChatHistory();
        handleNewChat(); // Start with a new chat interface
    };

    const setupPremiumFeatures = () => {
        if (isPremium) {
            premiumStatusBadge.textContent = 'Premium';
            premiumStatusBadge.className = 'badge badge-premium';
            ttsFeature.style.display = 'block';
            codeFeature.style.display = 'block';
            notPremiumMessage.style.display = 'none';
        } else {
            premiumStatusBadge.textContent = 'عادي';
            premiumStatusBadge.className = 'badge badge-standard';
            ttsFeature.style.display = 'none';
            codeFeature.style.display = 'none';
            notPremiumMessage.style.display = 'block';
        }
    };

    // --- Logout ---
    chatLogoutBtn.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });

    // --- Chat History ---
    const loadChatHistory = async () => {
        const chatsRef = collection(db, `users/${userId}/chats`);
        const q = query(chatsRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        chatHistoryList.innerHTML = '';
        querySnapshot.forEach(doc => {
            const chat = doc.data();
            const li = document.createElement('li');
            li.textContent = chat.title || 'محادثة جديدة';
            li.dataset.chatId = doc.id;
            li.addEventListener('click', () => loadChatMessages(doc.id));
            chatHistoryList.appendChild(li);
        });
    };

    // --- Chat Messages ---
    const loadChatMessages = (chatId) => {
        currentChatId = chatId;
        
        // Highlight active chat in history
        document.querySelectorAll('#chat-history-list li').forEach(li => {
            li.classList.toggle('active', li.dataset.chatId === chatId);
        });

        if (unsubscribeChat) {
            unsubscribeChat(); // Stop listening to the old chat
        }

        const messagesRef = collection(db, `users/${userId}/chats/${chatId}/messages`);
        const q = query(messagesRef, orderBy('createdAt'));

        chatWindow.innerHTML = ''; // Clear window for new messages

        unsubscribeChat = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    const message = change.doc.data();
                    appendMessage(message.role, message.content);
                }
            });
        });
    };

    const appendMessage = (role, content) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', role === 'user' ? 'user-message' : 'ai-message');
        messageDiv.innerHTML = `<p>${content.replace(/\n/g, '<br>')}</p>`; // Basic markdown for newlines
        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    };

    // --- Send Message & AI Interaction ---
    const handleSendMessage = async () => {
        const prompt = chatInput.value.trim();
        if (!prompt) return;

        chatInput.value = '';
        appendMessage('user', prompt);

        // Premium check for code
        if ((prompt.includes('/code') || prompt.includes('```')) && !isPremium) {
            appendMessage('ai', 'عذرًا، كتابة الأكواد هي ميزة للأعضاء المميزين فقط.');
            return;
        }

        // Create new chat document if it's the first message
        if (!currentChatId) {
            const chatsRef = collection(db, `users/${userId}/chats`);
            const newChatDoc = await addDoc(chatsRef, {
                title: prompt.substring(0, 30), // Use first 30 chars as title
                createdAt: serverTimestamp()
            });
            currentChatId = newChatDoc.id;
            loadChatHistory(); // Refresh history
            loadChatMessages(currentChatId); // Start listening to messages
        }

        // Save user message to Firestore
        const messagesRef = collection(db, `users/${userId}/chats/${currentChatId}/messages`);
        await addDoc(messagesRef, {
            role: 'user',
            content: prompt,
            createdAt: serverTimestamp()
        });

        // Get AI response
        const aiResponse = await getGeminiResponse(prompt);
        
        // Save AI response to Firestore
        await addDoc(messagesRef, {
            role: 'ai',
            content: aiResponse,
            createdAt: serverTimestamp()
        });
    };

    const getGeminiResponse = async (prompt) => {
        try {
            const response = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: prompt }]
                    }]
                })
            });

            if (!response.ok) {
                throw new Error(`API call failed with status: ${response.status}`);
            }

            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("Gemini API Error:", error);
            return "عذرًا، حدث خطأ أثناء التواصل مع الذكاء الاصطناعي. الرجاء المحاولة مرة أخرى.";
        }
    };

    // --- New Chat ---
    const handleNewChat = () => {
        currentChatId = null;
        if (unsubscribeChat) unsubscribeChat();
        chatWindow.innerHTML = '<div class="message ai-message"><p>مرحباً بك! أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم؟</p></div>';
        document.querySelectorAll('#chat-history-list li').forEach(li => li.classList.remove('active'));
    };

    // --- Event Listeners ---
    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    newChatBtn.addEventListener('click', handleNewChat);

    // --- Initial Load ---
    init();
});
