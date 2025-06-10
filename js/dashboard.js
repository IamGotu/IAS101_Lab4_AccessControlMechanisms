import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, onIdTokenChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, getDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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
const mfaToggle = document.getElementById('mfaToggle');

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();

      // Display user info
      document.getElementById("loggedUserFullName").textContent = `${userData.firstName} ${userData.middleName} ${userData.lastName}`;
      document.getElementById("loggedUserEmail").textContent = user.email;
      document.getElementById("loggedUserRole").textContent = userData.role;
      localStorage.setItem('role', userData.role);

      const manageUsersLink = document.querySelector('a[href="../src/manage_users.php"]');
      if (userData.role !== 'Admin' && userData.role !== 'Super Admin') {
        manageUsersLink.style.display = 'none';
      }

      const logsLink = document.querySelector('a[href="../src/logs.php"]');
      if (userData.role !== 'Admin' && userData.role !== 'Super Admin') {
        logsLink.style.display = 'none';
      }

      // Set toggle status based on Firestore
      mfaToggle.checked = userData.mfaEnabled === true;

      // Add toggle event listener
      mfaToggle.addEventListener('change', async () => {
        const enabled = mfaToggle.checked;
        try {
          await updateDoc(docRef, {
            mfaEnabled: enabled
          });
          alert(`MFA has been ${enabled ? 'enabled' : 'disabled'}.`);
        } catch (error) {
          console.error("Error updating MFA setting:", error);
          alert("Failed to update MFA setting. Try again.");
          mfaToggle.checked = !enabled; // revert toggle on error
        }
      });

    } else {
      console.error("No such user document!");
    }

  } else {
    window.location.href = "../src/login_sign_up.php";
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const logout = document.getElementById('logout');
  if (logout) {
    logout.addEventListener('click', (event) => {
      event.preventDefault();
      console.log('Logout button clicked');
      signOut(auth)
        .then(() => {
          clearToken();
          window.location.href = 'login_sign_up.php?nocache=' + new Date().getTime();
        })
        .catch((error) => {
          console.error('Error signing out:', error);
        });
    });
  } else {
    console.error('Logout button not found!');
  }
});

// Store and clear ID tokens
const storeToken = (idToken) => {
  localStorage.setItem('idToken', idToken);
};

const clearToken = () => {
  localStorage.removeItem('idToken');
};

onIdTokenChanged(auth, (user) => {
  if (user) {
    user.getIdToken().then((idToken) => {
      console.log('Refreshed ID Token:', idToken);
      storeToken(idToken);
    });
  } else {
    clearToken();
  }
});

// Inactivity logout
let inactivityTimer;

const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    console.log('User inactive. Logging out...');
    signOut(auth)
      .then(() => {
        clearToken();
        window.location.href = 'login_sign_up.php';
      })
      .catch((error) => {
        console.error('Error signing out:', error);
      });
  }, 30 * 1000);
};

document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);
resetInactivityTimer();