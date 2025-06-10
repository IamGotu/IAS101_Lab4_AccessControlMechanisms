import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCozlMcUAW_xd0XOpDQtFjp-SwORZLMRcI",
    authDomain: "web-authentication-39260.firebaseapp.com",
    projectId: "web-authentication-39260",
    storageBucket: "web-authentication-39260.appspot.com",
    messagingSenderId: "543723301135",
    appId: "1:543723301135:web:d35f8ca804cf2ef089767a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Ensure user is logged in and has the correct role
onAuthStateChanged(auth, async (user) => {
    if (!user || !user.emailVerified) {
        alert("You must be logged in with a verified email to access this page.");
        window.location.href = "login_sign_up.php";
        return;
    }

    try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.role !== "Admin" && data.role !== "Super Admin") {
            alert("Access denied. Only Admin or Super Admin can create users.");
            window.location.href = "dashboard.php";
        }
        } else {
        alert("User data not found.");
        window.location.href = "dashboard.php";
        }
    } catch (err) {
        console.error("Error checking role:", err);
        alert("Access check failed.");
        window.location.href = "dashboard.php";
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('addUserForm');

    form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = form.firstName.value;
    const middleName = form.middleName.value;
    const lastName = form.lastName.value;
    const email = form.email.value;
    const password = form.password.value;
    const role = form.role.value;

    try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", cred.user.uid), {
        firstName,
        middleName,
        lastName,
        email,
        role,
        disabled: false
        });
        alert('User created successfully!');
        form.reset();
    } catch (err) {
        console.error('Error creating user:', err);
        alert('Failed to create user: ' + err.message);
    }
    });
});