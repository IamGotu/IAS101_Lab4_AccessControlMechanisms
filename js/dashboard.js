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

// Check authentication state on page load
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // User is not logged in, redirect to login page
    console.log("User is not logged in. Redirecting to login page...");
    window.location.href = "login_sign_up.php";
  } else if (!user.emailVerified) {
    // User is logged in but email is not verified, redirect to login page
    console.log("User email is not verified. Redirecting to login page...");
    window.location.href = "login_sign_up.php";
  } else {
    // User is logged in and email is verified, fetch user data
    const loggedInUserId = user.uid; // Use the authenticated user's UID
    console.log('Logged In User ID:', loggedInUserId);

    // Fetch user data from Firestore (if needed)
    const docRef = doc(db, "users", loggedInUserId);
    getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          console.log('Document Data:', docSnap.data());
          const userData = docSnap.data();
          document.getElementById('loggedUserFirstName').innerText = userData.firstName;
          document.getElementById('loggedUserMiddleName').innerText = userData.middleName;
          document.getElementById('loggedUserLastName').innerText = userData.lastName;
          document.getElementById('loggedUserEmail').innerText = userData.email;
        } else {
          console.log("No such document found matching id!");
        }
      })
      .catch((error) => {
        console.log("Error getting document:", error);
      });
  }
});

// Logout functionality
document.addEventListener('DOMContentLoaded', () => {
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