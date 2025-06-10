import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  sendEmailVerification
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

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

// Google Sign-In Provider
const googleProvider = new GoogleAuthProvider();

// Function to show messages
function showMessage(message, divId) {
  var messageDiv = document.getElementById(divId);
  messageDiv.style.display = 'block';
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(function () {
    messageDiv.style.opacity = 0;
  }, 5000);
}

// Sign-Up with Email and Password
const signup = document.getElementById('signup');
signup.addEventListener('click', (event) => {
  event.preventDefault();

  // Inputs
  const email = document.getElementById('remail').value;
  const password = document.getElementById('rpassword').value;
  const firstName = document.getElementById('first_name').value;
  const middleName = document.getElementById('middle_name').value;
  const lastName = document.getElementById('last_name').value;

createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;

    // Updated user data structure
    const userData = {
      role: 'User',
      firstName: firstName,
      middleName: middleName,
      lastName: lastName,
      email: email,
      disabled: false,
      permissions: {
        canAddUser: false,
        canDeleteUser: false,
        canDisableUser: false,
        canUpdateUser: false
      }
    };

    showMessage('User signed up successfully', 'signUpMessage');

    // Send verification email
    sendEmailVerification(user)
      .then(() => {
        showMessage('Verification email sent. Please check your email.', 'signUpMessage');
      });

    // Store user data in Firestore
    const docRef = doc(db, "users", user.uid);
    setDoc(docRef, userData)
      .then(() => {
        window.location.href = 'login_sign_up.php';
      })
      .catch((error) => {
        console.error('Error saving user data: ', error);
      });
  })
  .catch((error) => {
    const errorCode = error.code;
    if (errorCode === 'auth/email-already-in-use') {
      showMessage('Email already exists!!!', 'signUpMessage');
    } else {
      showMessage('Error signing up user', 'signUpMessage');
    }
  });
});

// Login with Email and Password
const login = document.getElementById('login');
login.addEventListener('click', (event) => {
  event.preventDefault();

  // Inputs
  const email = document.getElementById('lemail').value;
  const password = document.getElementById('lpassword').value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in 
      const user = userCredential.user;
      if (user.emailVerified) {
        showMessage('User logged in successfully', 'loginMessage');
        window.location.href = 'dashboard.php';
      } else {
        showMessage('Please verify your email address before logging in.', 'loginMessage');
        signOut(auth); // Sign out the user if email is not verified
      }
    })
    .catch((error) => {
      const errorCode = error.code;
      if (errorCode == 'auth/user-not-found') {
        showMessage('User not found!!!', 'loginMessage');
        return;
      }
      if (errorCode == 'auth/wrong-password') {
        showMessage('Wrong password!!!', 'loginMessage');
        return;
      }
      showMessage('Error signing in user', 'loginMessage');
    });
});

// Google Sign-In
const googleLoginButton = document.getElementById('google');
googleLoginButton.addEventListener('click', (event) => {
  event.preventDefault();

  signInWithPopup(auth, googleProvider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access Google APIs.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;

      // The signed-in user info.
      const user = result.user;
      showMessage('User signed in with Google successfully', 'loginMessage');

      // Extract first name and last name from displayName
      const displayName = user.displayName || ''; // Fallback to empty string if displayName is null
      const nameParts = displayName.split(' '); // Split the full name into parts

      // Assign first name and last name
      const firstName = nameParts.slice(0, -1).join(' ') || 'N/A'; // Everything except the last part is the first name
      const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'N/A'; // Last part is the last name

      // Save user data to Firestore
      const userData = {
        email: user.email || 'N/A', // Fallback to 'N/A' if email is undefined
        firstName: firstName,
        middleName: 'N/A', // Middle name is not provided by Google
        lastName: lastName,
      };

      const docRef = doc(db, "users", user.uid);
      setDoc(docRef, userData)
        .then(() => {
          console.log('User data saved to Firestore');
          window.location.href = 'dashboard.php';
        })
        .catch((error) => {
          console.error('Error saving user data: ', error);
        });
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      showMessage(`Error during Google Sign-In: ${errorMessage}`, 'loginMessage');
    });
});