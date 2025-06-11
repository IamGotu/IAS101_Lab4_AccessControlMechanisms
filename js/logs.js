import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged,
    signOut
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

// Firebase Configuration
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

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Monitor authentication state
    onAuthStateChanged(auth, async (user) => {
        if (!user || !user.emailVerified) {
            window.location.href = "login_sign_up.php";
            return;
        }

        // Check user role before proceeding
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const currentUserRole = userData.role || "User";

                // Add access control check here
                if (currentUserRole !== "Admin" && currentUserRole !== "Super Admin") {
                    await logAction(user.email, "access_denied", "Unauthorized access attempt", 
                        `User with role ${currentUserRole} attempted to access logs page`);
                    alert("Access denied. You do not have permission to access this page.");
                    window.location.href = "dashboard.php";
                    return;
                }

                // Continue with the rest of the code if access is granted
                document.getElementById("loggedUserFullName").textContent = 
                    `${userData.firstName || ''} ${userData.middleName || ''} ${userData.lastName || ''}`.trim();
                document.getElementById("loggedUserEmail").textContent = user.email;
                document.getElementById("loggedUserRole").textContent = userData.role || "N/A";
                
                // Load logs
                loadLogs();
            }
        } catch (error) {
            console.error("Error loading user data:", error);
            window.location.href = "dashboard.php";
        }
    });

    // Get DOM elements
    const logsContainer = document.getElementById('logsContainer');
    const filterType = document.getElementById('filterType');
    const searchUser = document.getElementById('searchUser');
   
    const logout = document.getElementById('logout');
    if (logout) {
        console.log('Logout button found');
        logout.addEventListener('click', (event) => {
            event.preventDefault();
            console.log('Logout button clicked');

            signOut(auth)
                .then(() => {
                    window.location.href = 'login_sign_up.php?nocache=' + new Date().getTime();
                })
                .catch((error) => {
                    console.error('Error signing out:', error);
                });
        });
    } else {
        console.warn('Logout button not found in DOM');
    }

    // Load and display logs
    async function loadLogs() {
        try {
            logsContainer.innerHTML = '<div class="loading">Loading logs...</div>';
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
                    <div class="log-user">User: <strong>${data.user_email || 'N/A'}</strong></div>
                    <div class="log-status ${data.status?.toLowerCase() || ''}">Status: ${data.status || 'UNKNOWN'}</div>
                    <div class="log-details">${data.details || ''}</div>
                `;
                logsContainer.appendChild(logDiv);
            });
        } catch (error) {
            logsContainer.innerHTML = '<div class="error">Failed to load logs. Please try again.</div>';
            console.error("Error loading logs:", error);
        }
    }

    // Filter logs
    async function applyFilters() {
        try {
            const type = filterType.value.trim();
            const userSearch = searchUser.value.toLowerCase().trim();
            
            logsContainer.innerHTML = '<div class="loading">Applying filters...</div>';
            const q = query(
                collection(db, "logs"),
                orderBy("timestamp", "desc"),
                limit(100)
            );
            const snapshot = await getDocs(q);
            
            logsContainer.innerHTML = '';
            snapshot.forEach((doc) => {
                const data = doc.data();
                const matchesType = !type || data.action === type;
                const matchesUser = !userSearch || 
                    (data.user_email && data.user_email.toLowerCase().includes(userSearch));
                
                if (matchesType && matchesUser) {
                    const logDiv = document.createElement('div');
                    logDiv.className = 'log-entry';
                    logDiv.innerHTML = `
                        <div class="log-header">${data.action?.toUpperCase() || 'UNKNOWN'}</div>
                        <div class="log-meta">${data.timestamp?.toDate().toLocaleString() || 'No timestamp'}</div>
                        <div class="log-user">User: <strong>${data.user_email || 'N/A'}</strong></div>
                        <div class="log-status ${data.status?.toLowerCase() || ''}">Status: ${data.status || 'UNKNOWN'}</div>
                        <div class="log-details">${data.details || ''}</div>
                    `;
                    logsContainer.appendChild(logDiv);
                }
            });
            
            if (logsContainer.children.length === 0) {
                logsContainer.innerHTML = '<div class="no-results">No matching logs found</div>';
            }
        } catch (error) {
            logsContainer.innerHTML = '<div class="error">Failed to apply filters. Please try again.</div>';
            console.error("Error filtering logs:", error);
        }
    }

    async function logAction(userEmail, action, status, details) {
        try {
            await addDoc(collection(db, "logs"), {
                timestamp: new Date(),
                action: action,
                user_email: userEmail,
                status: status,
                details: details
            });
            console.log("Action logged:", action);
        } catch (error) {
            console.error("Error logging action:", error);
        }
    }

    // Event listeners for filters
    filterType.addEventListener('change', applyFilters);
    searchUser.addEventListener('input', applyFilters);
});