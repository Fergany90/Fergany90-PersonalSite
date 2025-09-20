
import { db } from './firebase.js';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const tabs = document.querySelectorAll('.nav-tab');
    const sections = document.querySelectorAll('.admin-section');
    const logoutBtn = document.getElementById('logout-btn');
    const membersTbody = document.getElementById('members-tbody');
    const addMemberBtn = document.getElementById('add-member-btn');
    const modal = document.getElementById('add-member-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const saveMemberBtn = document.getElementById('save-member-btn');
    const modalError = document.getElementById('modal-error');
    const newMemberNameInput = document.getElementById('new-member-name');
    const newMemberPhoneInput = document.getElementById('new-member-phone');

    const announcementTitleInput = document.getElementById('announcement-title');
    const announcementContentInput = document.getElementById('announcement-content');
    const sendAnnouncementBtn = document.getElementById('send-announcement-btn');
    const announcementsList = document.getElementById('announcements-list');

    // --- Tab Navigation ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // --- Logout ---
    logoutBtn.addEventListener('click', () => {
        window.location.href = 'index.html';
    });

    // --- Modal Handling ---
    addMemberBtn.addEventListener('click', () => modal.style.display = 'flex');
    closeModalBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
        if (e.target == modal) {
            modal.style.display = 'none';
        }
    });

    // --- Firestore Collections ---
    const usersCollection = collection(db, 'users');
    const announcementsCollection = collection(db, 'announcements');

    // --- Member Management ---

    // Function to generate a unique 6-digit code
    const generateUniqueCode = async () => {
        let code;
        let isUnique = false;
        const existingCodes = new Set();
        const querySnapshot = await getDocs(usersCollection);
        querySnapshot.forEach(doc => existingCodes.add(doc.data().code));

        while (!isUnique) {
            code = Math.floor(100000 + Math.random() * 900000).toString();
            if (!existingCodes.has(code)) {
                isUnique = true;
            }
        }
        return code;
    };

    // READ / Fetch and display members
    const fetchMembers = async () => {
        membersTbody.innerHTML = ''; // Clear table
        const querySnapshot = await getDocs(usersCollection);
        querySnapshot.forEach(doc => {
            const user = doc.data();
            const userId = doc.id;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.phone}</td>
                <td>${user.code}</td>
                <td>
                    <i class="fas ${user.isPremium ? 'fa-star' : 'fa-star-o'} premium-toggle" data-id="${userId}" data-premium="${user.isPremium}" title="Toggle Premium"></i>
                </td>
                <td>
                    <i class="fas fa-trash-alt action-icon delete" data-id="${userId}" title="حذف العضو"></i>
                    <i class="fas fa-ban action-icon ban" data-id="${userId}" title="حظر العضو (قريبًا)"></i>
                    <i class="fas fa-exclamation-triangle action-icon warn" data-id="${userId}" title="إرسال تحذير (قريبًا)"></i>
                </td>
            `;
            membersTbody.appendChild(row);
        });
    };

    // CREATE / Add a new member
    saveMemberBtn.addEventListener('click', async () => {
        const name = newMemberNameInput.value.trim();
        const phone = newMemberPhoneInput.value.trim();

        if (!name || !phone) {
            modalError.textContent = 'الرجاء ملء جميع الحقول.';
            return;
        }

        try {
            const newCode = await generateUniqueCode();
            await addDoc(usersCollection, {
                name: name,
                phone: phone,
                code: newCode,
                isPremium: false,
                createdAt: serverTimestamp()
            });
            modal.style.display = 'none';
            newMemberNameInput.value = '';
            newMemberPhoneInput.value = '';
            modalError.textContent = '';
            fetchMembers(); // Refresh the table
        } catch (error) {
            console.error("Error adding member: ", error);
            modalError.textContent = 'حدث خطأ أثناء إضافة العضو.';
        }
    });

    // UPDATE (Premium) & DELETE Member
    membersTbody.addEventListener('click', async (e) => {
        const target = e.target;
        const userId = target.dataset.id;

        if (!userId) return;

        // Toggle Premium Status
        if (target.classList.contains('premium-toggle')) {
            const isCurrentlyPremium = target.dataset.premium === 'true';
            const userDocRef = doc(db, 'users', userId);
            await updateDoc(userDocRef, { isPremium: !isCurrentlyPremium });
            fetchMembers(); // Refresh table to show change
        }

        // Delete Member
        if (target.classList.contains('delete')) {
            if (confirm('هل أنت متأكد من أنك تريد حذف هذا العضو نهائيًا؟')) {
                const userDocRef = doc(db, 'users', userId);
                await deleteDoc(userDocRef);
                fetchMembers(); // Refresh table
            }
        }
    });

    // --- Announcement Management ---

    // READ / Fetch and display announcements
    const fetchAnnouncements = async () => {
        announcementsList.innerHTML = '';
        const q = query(announcementsCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
            const announcement = doc.data();
            const announcementId = doc.id;
            const item = document.createElement('div');
            item.className = 'announcement-item';
            item.innerHTML = `
                <h3>${announcement.title}</h3>
                <p>${announcement.content}</p>
                <small>نشر في: ${new Date(announcement.createdAt.seconds * 1000).toLocaleString('ar-EG')}</small>
                <div class="announcement-actions">
                    <button class="delete" data-id="${announcementId}"><i class="fas fa-trash-alt"></i> حذف</button>
                </div>
            `;
            announcementsList.appendChild(item);
        });
    };

    // CREATE / Send a new announcement
    sendAnnouncementBtn.addEventListener('click', async () => {
        const title = announcementTitleInput.value.trim();
        const content = announcementContentInput.value.trim();

        if (!title || !content) {
            alert('الرجاء كتابة عنوان ومحتوى للإعلان.');
            return;
        }

        await addDoc(announcementsCollection, {
            title: title,
            content: content,
            createdAt: serverTimestamp()
        });

        announcementTitleInput.value = '';
        announcementContentInput.value = '';
        fetchAnnouncements(); // Refresh the list
    });

    // DELETE Announcement
    announcementsList.addEventListener('click', async (e) => {
        if (e.target.closest('.delete')) {
            const button = e.target.closest('.delete');
            const announcementId = button.dataset.id;
            if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
                await deleteDoc(doc(db, 'announcements', announcementId));
                fetchAnnouncements(); // Refresh list
            }
        }
    });

    // --- Initial Data Load ---
    fetchMembers();
    fetchAnnouncements();
});
