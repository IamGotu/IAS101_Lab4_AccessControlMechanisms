<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="stylesheet" href="../css/add_user.css">
  <title>Add User</title>
  <script type="module">
    
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
  </script>
</head>
<body>
  <h1>Add New User</h1>
  <form id="addUserForm">
    <label>First Name: <input type="text" name="firstName" required></label><br />
    <label>Middle Name: <input type="text" name="middleName"></label><br />
    <label>Last Name: <input type="text" name="lastName" required></label><br />
    <label>Email: <input type="email" name="email" required></label><br />
    <label>Password: <input type="password" name="password" required></label><br />
    <label>Role:
      <select name="role" required>
        <option value="Super Admin">Super Admin</option>
        <option value="Admin">Admin</option>
        <option value="User" selected>User</option>
      </select>
    </label><br />
    <button type="submit">Create User</button>
  </form>
  <p><a href="manage_users.php">Back to User Management</a></p>
</body>
</html>