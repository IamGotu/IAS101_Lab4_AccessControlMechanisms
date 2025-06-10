import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    query, 
    orderBy, 
    limit, 
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyCozlMcUAW_xd0XOpDQtFjp-SwORZLMRcI",
    authDomain: "web-authentication-39260.firebaseapp.com",
    projectId: "web-authentication-39260",
    storageBucket: "web-authentication-39260.appspot.com",
    messagingSenderId: "543723301135",
    appId: "1:543723301135:web:d35f8ca804cf2ef089767a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, async (user) => {
        if (!user || !user.emailVerified) {
            window.location.href = "login_sign_up.php";
            return;
        }

        // Fetch user data
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            document.getElementById("loggedUserFullName").textContent = 
                `${userData.firstName || ''} ${userData.middleName || ''} ${userData.lastName || ''}`.trim();
            document.getElementById("loggedUserEmail").textContent = user.email;
            document.getElementById("loggedUserRole").textContent = userData.role || "N/A";
        }

        // Load logs
        loadLogs();
    });

    // Logs functions
    const logsContainer = document.getElementById('logsContainer');
    const filterType = document.getElementById('filterType');
    const searchUser = document.getElementById('searchUser');

    async function loadLogs() {
        logsContainer.innerHTML = 'Loading...';
        const q = query(
            collection(db, "logs"),
            orderBy("timestamp", "desc"),
            limit(100)
        );
        const snapshot = await getDocs(q);
        logsContainer.innerHTML = '';
        snapshot.forEach((doc) => {
            const data = doc.data();
            const logDiv = document.createElement('div');
            logDiv.className = 'log-entry';
            logDiv.innerHTML = `
                <div class="log-header">${data.action?.toUpperCase() || 'UNKNOWN'}</div>
                <div class="log-meta">${data.timestamp?.toDate().toLocaleString() || 'No timestamp'}</div>
                <div class="log-action">User: <strong>${data.user_email || 'N/A'}</strong></div>
                <div class="log-status ${data.status?.toLowerCase() || ''}">Status: ${data.status || 'UNKNOWN'}</div>
                <div class="log-action">${data.details || ''}</div>
            `;
            logsContainer.appendChild(logDiv);
        });
    }

    // Filter functions
    filterType.addEventListener('change', applyFilters);
    searchUser.addEventListener('input', applyFilters);

    async function applyFilters() {
        const type = filterType.value.trim();
        const userSearch = searchUser.value.toLowerCase().trim();

        logsContainer.innerHTML = 'Filtering...';
        const q = query(
            collection(db, "logs"),
            orderBy("timestamp", "desc"),
            limit(100)
        );
        const snapshot = await getDocs(q);
        logsContainer.innerHTML = '';
        snapshot.forEach((doc) => {
            const data = doc.data();
            const matchType = !type || data.action === type;
            const matchUser = !userSearch || (data.user_email && data.user_email.toLowerCase().includes(userSearch));
            if (matchType && matchUser) {
                const logDiv = document.createElement('div');
                logDiv.className = 'log-entry';
                logDiv.innerHTML = `
                    <div class="log-header">${data.action?.toUpperCase() || 'UNKNOWN'}</div>
                    <div class="log-meta">${data.timestamp?.toDate().toLocaleString() || 'No timestamp'}</div>
                    <div class="log-action">User: <strong>${data.user_email || 'N/A'}</strong></div>
                    <div class="log-status ${data.status?.toLowerCase() || ''}">Status: ${data.status || 'UNKNOWN'}</div>
                    <div class="log-action">${data.details || ''}</div>
                `;
                logsContainer.appendChild(logDiv);
            }
        });
    }
});