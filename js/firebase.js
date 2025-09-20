
// --- تحذير أمني هام جدا --- //
// لا تشارك هذا الملف أو مفاتيح API الموجودة بداخله مع أي شخص.
// يجب عليك تغيير هذه المفاتيح فورًا من لوحة تحكم Firebase و Google AI.
// هذا الكود يقوم بتهيئة Firebase في مشروعك.

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBA3jRorJJQZZMQ4BbVR5m1TVAiyXAq9ag",
  authDomain: "fergany-ai-32a9a.firebaseapp.com",
  projectId: "fergany-ai-32a9a",
  storageBucket: "fergany-ai-32a9a.firebasestorage.app",
  messagingSenderId: "446255526018",
  appId: "1:446255526018:web:c9822cc466d2ee091b849b",
  measurementId: "G-0RY5QTVCBS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Export the services to be used in other files
export { db, auth };
