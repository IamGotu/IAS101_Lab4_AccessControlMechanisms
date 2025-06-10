<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Access Logs - Admin Dashboard</title>
    <link rel="stylesheet" href="../css/logs.css" />
    <script src="https://www.gstatic.com/firebasejs/10.5.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.5.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore-compat.js"></script>
</head>
<body>
    <?php include '../includes/sidebar.php'; ?>
    <link rel="stylesheet" href="../css/sidebar.css" />

    <div class="main-content">
        <h1>System Access Logs</h1>

        <!-- Optional Filter Bar -->
        <div class="filter-bar">
            <input type="text" id="searchUser" placeholder="Search by user email...">
            <select id="filterType">
                <option value="">All Types</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="update">Update</option>
                <option value="unauthorized">Unauthorized Access</option>
            </select>
        </div>

        <div id="logsContainer"></div>
    </div>

    <script type="module">
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
        const app = firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();
        const auth = firebase.auth();

        auth.onAuthStateChanged(async (user) => {
            if (!user || !user.emailVerified) {
                window.location.href = "login_sign_up.php";
                return;
            }

            // Fetch user data from Firestore
            const userDoc = await db.collection("users").doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                
                // Update sidebar user info
                document.getElementById("loggedUserFullName").textContent = 
                    `${userData.firstName || ''} ${userData.middleName || ''} ${userData.lastName || ''}`.trim();
                
                document.getElementById("loggedUserEmail").textContent = user.email;
                document.getElementById("loggedUserRole").textContent = userData.role || "N/A";
            }

            // Load logs
            loadLogs();
        });

        // Rest of your logs loading code...
        const logsContainer = document.getElementById('logsContainer');
        const filterType = document.getElementById('filterType');
        const searchUser = document.getElementById('searchUser');

        async function loadLogs() {
            logsContainer.innerHTML = '';
            const snapshot = await db.collection("logs")
                                    .orderBy("timestamp", "desc")
                                    .limit(100)
                                    .get();

            snapshot.forEach(doc => {
                const data = doc.data();
                const logDiv = document.createElement('div');
                logDiv.className = 'log-entry';

                logDiv.innerHTML = `
                    <div class="log-header">${data.action.toUpperCase()}</div>
                    <div class="log-meta">${new Date(data.timestamp?.toDate()).toLocaleString()}</div>
                    <div class="log-action">User: <strong>${data.user_email || 'N/A'}</strong></div>
                    <div class="log-status ${data.status.toLowerCase()}">Status: ${data.status}</div>
                    <div class="log-action">${data.details || ''}</div>
                `;
                logsContainer.appendChild(logDiv);
            });
        }

        filterType.addEventListener('change', applyFilters);
        searchUser.addEventListener('input', applyFilters);

        async function applyFilters() {
            const type = filterType.value.trim();
            const userSearch = searchUser.value.toLowerCase().trim();

            logsContainer.innerHTML = '';
            const snapshot = await db.collection("logs")
                                    .orderBy("timestamp", "desc")
                                    .limit(100)
                                    .get();

            snapshot.forEach(doc => {
                const data = doc.data();
                const matchType = !type || data.action === type;
                const matchUser = !userSearch || (data.user_email && data.user_email.toLowerCase().includes(userSearch));
                if (matchType && matchUser) {
                    const logDiv = document.createElement('div');
                    logDiv.className = 'log-entry';

                    logDiv.innerHTML = `
                        <div class="log-header">${data.action.toUpperCase()}</div>
                        <div class="log-meta">${new Date(data.timestamp?.toDate()).toLocaleString()}</div>
                        <div class="log-action">User: <strong>${data.user_email || 'N/A'}</strong></div>
                        <div class="log-status ${data.status.toLowerCase()}">Status: ${data.status}</div>
                        <div class="log-action">${data.details || ''}</div>
                    `;
                    logsContainer.appendChild(logDiv);
                }
            });
        }
    </script>
</body>
</html>