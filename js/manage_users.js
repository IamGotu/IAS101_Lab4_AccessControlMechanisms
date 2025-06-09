import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, doc, getDoc, updateDoc
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

// Firebase configuration
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
const db = getFirestore(app);
const auth = getAuth(app);

// Handle auth state
onAuthStateChanged(auth, async (user) => {
  if (!user || !user.emailVerified) {
    window.location.href = "login_sign_up.php";
    return;
  }

  // Load current user's profile into sidebar
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      document.getElementById("loggedUserFullName").textContent = `${data.firstName} ${data.middleName} ${data.lastName}`;
      document.getElementById("loggedUserEmail").textContent = user.email;
      document.getElementById("loggedUserRole").textContent = data.role;
    } else {
      console.error("No such user document!");
    }
  } catch (err) {
    console.error("Error fetching user profile:", err);
  }

  // Load all users for management
  const userListDiv = document.getElementById("userList");
  if (userListDiv) {
    userListDiv.innerHTML = "";

    const usersSnapshot = await getDocs(collection(db, "users"));
    usersSnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const uid = docSnap.id;

      const userCard = document.createElement("div");
      userCard.classList.add("user-card");
      userCard.innerHTML = `
        <form data-uid="${uid}">
          <label>First Name: <input type="text" name="firstName" value="${data.firstName}" /></label><br>
          <label>Middle Name: <input type="text" name="middleName" value="${data.middleName}" /></label><br>
          <label>Last Name: <input type="text" name="lastName" value="${data.lastName}" /></label><br>
          <label>Email: <input type="email" value="${data.email}" disabled /></label><br>
          <label>Role:
            <select name="role">
              <option value="Super Admin" ${data.role === 'Super Admin' ? 'selected' : ''}>Super Admin</option>
              <option value="Admin" ${data.role === 'Admin' ? 'selected' : ''}>Admin</option>
              <option value="User" ${data.role === 'User' ? 'selected' : ''}>User</option>
            </select>
          </label><br>
          <button type="submit">Update</button>
        </form>
        <hr>
      `;
      userListDiv.appendChild(userCard);

      // Form submit handler
      const form = userCard.querySelector("form");
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const updatedData = {
          firstName: form.firstName.value,
          middleName: form.middleName.value,
          lastName: form.lastName.value,
          role: form.role.value
        };

        try {
          await updateDoc(doc(db, "users", uid), updatedData);
          alert("User updated successfully!");
        } catch (err) {
          console.error("Error updating user:", err);
          alert("Failed to update user.");
        }
      });
    });
  }
});
