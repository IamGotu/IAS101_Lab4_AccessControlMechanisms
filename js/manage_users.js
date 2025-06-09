import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, doc, getDoc, updateDoc, deleteDoc
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

import {
  getAuth, onAuthStateChanged, signOut
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
  let currentUserRole = "";
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      currentUserRole = data.role;

      if (currentUserRole !== "Admin" && currentUserRole !== "Super Admin") {
        alert("Access denied. You do not have permission to access this page.");
        window.location.href = "dashboard.php";
        return;
      }

      document.getElementById("loggedUserFullName").textContent = `${data.firstName} ${data.middleName} ${data.lastName}`;
      document.getElementById("loggedUserEmail").textContent = user.email;
      document.getElementById("loggedUserRole").textContent = currentUserRole;
    } else {
      console.error("No such user document!");
      return;
    }
  } catch (err) {
    console.error("Error fetching user profile:", err);
    return;
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

      const isSuperAdmin = currentUserRole === "Super Admin";

      userCard.innerHTML = `
        <form data-uid="${uid}">
          <label>First Name: <input type="text" name="firstName" value="${data.firstName}" /></label><br>
          <label>Middle Name: <input type="text" name="middleName" value="${data.middleName}" /></label><br>
          <label>Last Name: <input type="text" name="lastName" value="${data.lastName}" /></label><br>
          <label>Email: <input type="email" value="${data.email}" disabled /></label><br>
          <label>Role:
            <select name="role" ${!isSuperAdmin ? "disabled" : ""}>
              <option value="Super Admin" ${data.role === 'Super Admin' ? 'selected' : ''}>Super Admin</option>
              <option value="Admin" ${data.role === 'Admin' ? 'selected' : ''}>Admin</option>
              <option value="User" ${data.role === 'User' ? 'selected' : ''}>User</option>
            </select>
          </label><br>
          ${isSuperAdmin ? `
            <button type="button" class="disable-btn">Disable</button>
            <button type="button" class="delete-btn">Delete</button>
          ` : ""}
          <button type="submit">Update</button>
        </form>
        <hr>
      `;
      userListDiv.appendChild(userCard);

      const form = userCard.querySelector("form");

      if (isSuperAdmin) {
        // ✅ Disable account
        userCard.querySelector(".disable-btn").addEventListener("click", async () => {
          try {
            await updateDoc(doc(db, "users", uid), { disabled: true });
            alert("User disabled.");
          } catch (err) {
            console.error("Disable failed:", err);
            alert("Error disabling user.");
          }
        });

        // ✅ Delete account
        userCard.querySelector(".delete-btn").addEventListener("click", async () => {
          if (!confirm("Are you sure you want to delete this user?")) return;
          try {
            await deleteDoc(doc(db, "users", uid));
            alert("User deleted.");
            window.location.reload();
          } catch (err) {
            console.error("Delete failed:", err);
            alert("Error deleting user.");
          }
        });
      }

      // ✅ Update user data
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const updatedData = {
          firstName: form.firstName.value,
          middleName: form.middleName.value,
          lastName: form.lastName.value
        };

        if (isSuperAdmin) {
          updatedData.role = form.role.value;
        }

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

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const addUserBtn = document.getElementById('addUserBtn');
  if (addUserBtn) {
    addUserBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'add_user.php';
    });
  }

  const logout = document.getElementById('logout');
  if (logout) {
    logout.addEventListener('click', (event) => {
      event.preventDefault();
      signOut(auth)
        .then(() => {
          clearToken(); // Optional: define clearToken() if using localStorage/session
          window.location.href = 'login_sign_up.php?nocache=' + new Date().getTime();
        })
        .catch((error) => {
          console.error('Error signing out:', error);
        });
    });
  }
});