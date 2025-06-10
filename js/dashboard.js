import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, getDoc, doc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCozlMcUAW_xd0XOpDQtFjp-SwORZLMRcI",
  authDomain: "web-authentication-39260.firebaseapp.com",
  projectId: "web-authentication-39260",
  storageBucket: "web-authentication-39260.firebasestorage.app",
  messagingSenderId: "543723301135",
  appId: "1:543723301135:web:d35f8ca804cf2ef089767a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();

      // Update UI
      document.getElementById("loggedUserFullName").textContent = `${userData.firstName} ${userData.middleName} ${userData.lastName}`;
      document.getElementById("loggedUserEmail").textContent = user.email;
      document.getElementById("loggedUserRole").textContent = userData.role;

      // Set role in localStorage for role-based UI control
      localStorage.setItem('role', userData.role);

      // Optionally, check Manage Users link visibility here too
      const manageUsersLink = document.querySelector('a[href="../src/manage_users.php"]');
      if (userData.role !== 'Admin' && userData.role !== 'Super Admin') {
        manageUsersLink.style.display = 'none';
      }

    } else {
      console.error("No such user document!");
    }
  } else {
  
    window.location.href = "../src/login_sign_up.php"; // Redirect if not logged in
  }
});

document.addEventListener('DOMContentLoaded', () => {
  // Logout functionality
  const logout = document.getElementById('logout');

  if (logout) {
    logout.addEventListener('click', (event) => {
      event.preventDefault(); // Prevent default link behavior
      console.log('Logout button clicked');
  
      signOut(auth)
        .then(() => {
          clearToken(); // Clear the token
          window.location.href = 'login_sign_up.php?nocache=' + new Date().getTime(); // Redirect to login page
        })
        .catch((error) => {
          console.error('Error signing out:', error);
        });
    });
  } else {
    console.error('Logout button not found!');
  }
});

// Store the Firebase ID token in localStorage
const storeToken = (idToken) => {
  localStorage.setItem('idToken', idToken);
};


// Clear the Firebase ID token from localStorage
const clearToken = () => {
  localStorage.removeItem('idToken');
};

// Refresh the Firebase ID token before it expires
onIdTokenChanged(auth, (user) => {
  if (user) {
    user.getIdToken().then((idToken) => {
      console.log('Refreshed ID Token:', idToken);
      storeToken(idToken); // Store the refreshed token
    });
  } else {
    clearToken(); // Clear the token if the user is logged out
  }
});

let inactivityTimer;

// Reset the inactivity timer on user activity
const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    console.log('User inactive. Logging out...');
    signOut(auth)
      .then(() => {
        clearToken(); // Clear the token
        window.location.href = 'login_sign_up.php'; // Redirect to login page
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  }, 30 * 1000); // 30 seconds of inactivity
};

// Track user activity
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);

// Start the timer when the page loads
resetInactivityTimer();