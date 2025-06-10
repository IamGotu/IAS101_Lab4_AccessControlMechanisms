import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  signOut
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCozlMcUAW_xd0XOpDQtFjp-SwORZLMRcI",
  authDomain: "web-authentication-39260.firebaseapp.com",
  projectId: "web-authentication-39260",
  storageBucket: "web-authentication-39260.appspot.com",
  messagingSenderId: "543723301135",
  appId: "1:543723301135:web:d35f8ca804cf2ef089767a"
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Utility: Display Message
function showMessage(msg, divId) {
  const msgDiv = document.getElementById(divId);
  msgDiv.style.display = 'block';
  msgDiv.innerHTML = msg;
  msgDiv.style.opacity = 1;
  setTimeout(() => { msgDiv.style.opacity = 0; }, 5000);
}

// Sign-Up
document.getElementById('signup')?.addEventListener('click', async (e) => {
  e.preventDefault();

  const email = document.getElementById('remail').value;
  const password = document.getElementById('rpassword').value;
  const firstName = document.getElementById('first_name').value;
  const middleName = document.getElementById('middle_name').value;
  const lastName = document.getElementById('last_name').value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await sendEmailVerification(user);
    showMessage("Verification email sent. Please check your email.", 'signUpMessage');

    const userData = {
      email,
      firstName,
      middleName,
      lastName,
      role: 'User',
      mfaEnabled: false,
      disabled: false,
      permissions: {
        canAdd: false,
        canDelete: false,
        canDisable: false,
        canUpdate: false
      }
    };

    await setDoc(doc(db, "users", user.uid), userData);
    showMessage("User signed up successfully.", 'signUpMessage');
    window.location.href = 'login_sign_up.php';

  } catch (error) {
    const errorMsg = error.code === 'auth/email-already-in-use' ?
      'Email already exists!' : 'Error signing up.';
    showMessage(errorMsg, 'signUpMessage');
  }
});

// Login
document.getElementById('login')?.addEventListener('click', async (e) => {
  e.preventDefault();
  const email = document.getElementById('lemail').value;
  const password = document.getElementById('lpassword').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (!user.emailVerified) {
      showMessage("Please verify your email before logging in.", 'loginMessage');
      await signOut(auth);
      return;
    }

    const docSnap = await getDoc(doc(db, 'users', user.uid));
    if (!docSnap.exists()) {
      showMessage("User data not found in Firestore.", 'loginMessage');
      await signOut(auth);
      return;
    }

    const userData = docSnap.data();
    if (userData.mfaEnabled) {
      const res = await fetch('send_otp.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, email: user.email })
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem('mfaUserId', user.uid);
        window.location.href = 'verify_otp.php';
      } else {
        showMessage("Failed to send OTP: " + data.message, 'loginMessage');
        await signOut(auth);
      }
    } else {
      showMessage("Login successful.", 'loginMessage');
      window.location.href = 'dashboard.php';
    }

  } catch (error) {
    const msg = error.code === 'auth/user-not-found' ? "User not found!"
      : error.code === 'auth/wrong-password' ? "Wrong password!"
      : "Error signing in.";
    showMessage(msg, 'loginMessage');
  }
});

// Google Sign-In
document.getElementById('google')?.addEventListener('click', async (e) => {
  e.preventDefault();

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const displayName = user.displayName || '';
    const nameParts = displayName.split(' ');
    const firstName = nameParts.slice(0, -1).join(' ') || 'N/A';
    const lastName = nameParts.at(-1) || 'N/A';

    const userData = {
      email: user.email || 'N/A',
      firstName,
      middleName: 'N/A',
      lastName
    };

    await setDoc(doc(db, "users", user.uid), userData);
    window.location.href = 'dashboard.php';

  } catch (error) {
    showMessage(`Google Sign-In Error: ${error.message}`, 'loginMessage');
  }
});