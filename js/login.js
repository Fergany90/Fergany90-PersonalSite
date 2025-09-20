import { db } from './firebase.js';
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const memberBtn = document.getElementById('member-btn');
    const adminBtn = document.getElementById('admin-btn');
    const memberLogin = document.getElementById('member-login');
    const adminLogin = document.getElementById('admin-login');
    const errorMessage = document.getElementById('error-message');

    const memberCodeInput = document.getElementById('member-code');
    const adminPasswordInput = document.getElementById('admin-password');
    const memberLoginBtn = document.getElementById('member-login-btn');
    const adminLoginBtn = document.getElementById('admin-login-btn');

    // Redirect if already logged in
    if (localStorage.getItem('userId')) {
        window.location.href = 'chat.html';
    }

    // Toggle between member and admin forms
    memberBtn.addEventListener('click', () => {
        memberBtn.classList.add('active');
        adminBtn.classList.remove('active');
        memberLogin.style.display = 'flex';
        adminLogin.style.display = 'none';
        errorMessage.textContent = '';
    });

    adminBtn.addEventListener('click', () => {
        adminBtn.classList.add('active');
        memberBtn.classList.remove('active');
        adminLogin.style.display = 'flex';
        memberLogin.style.display = 'none';
        errorMessage.textContent = '';
    });

    // --- Admin Login Logic ---
    const handleAdminLogin = () => {
        const password = adminPasswordInput.value;
        if (password === '9090') {
            window.location.href = 'admin.html';
        } else {
            errorMessage.textContent = 'كلمة مرور المدير غير صحيحة.';
        }
    };

    adminLoginBtn.addEventListener('click', handleAdminLogin);
    adminPasswordInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleAdminLogin();
        }
    });

    // --- Member Login Logic ---
    const handleMemberLogin = async () => {
        const code = memberCodeInput.value.trim();
        if (!code || code.length !== 6 || !/^[0-9]+$/.test(code)){
            errorMessage.textContent = 'الرجاء إدخال كود صحيح مكون من 6 أرقام.';
            return;
        }

        errorMessage.textContent = 'جارِ التحقق...'; // Feedback for the user

        const usersRef = collection(db, 'users');
        const q = query(usersRef, where("code", "==", code));

        try {
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                errorMessage.textContent = 'الكود غير صحيح. الرجاء المحاولة مرة أخرى أو تواصل مع المطور.';
            } else {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();

                localStorage.setItem('userId', userDoc.id);
                localStorage.setItem('userName', userData.name);
                localStorage.setItem('isPremium', userData.isPremium);

                window.location.href = 'chat.html';
            }
        } catch (error) {
            console.error("Error logging in: ", error);
            errorMessage.textContent = 'حدث خطأ أثناء محاولة تسجيل الدخول. حاول مرة أخرى.';
        }
    };

    memberLoginBtn.addEventListener('click', handleMemberLogin);
    memberCodeInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            handleMemberLogin();
        }
    });
});