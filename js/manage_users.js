import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import {
  getFirestore, collection, getDocs, doc, getDoc,
  updateDoc, deleteDoc, addDoc
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
  let currentUserPermissions = {
    canAdd: false,
    canUpdate: false,
    canDelete: false,
    canDisable: false
  };
  let currentUserRole = "";

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      currentUserRole = data.role;

      currentUserPermissions = {
        canAdd: data.permissions?.canAdd === true,
        canUpdate: data.permissions?.canUpdate === true,
        canDelete: data.permissions?.canDelete === true,
        canDisable: data.permissions?.canDisable === true
      };

      const addUserBtn = document.getElementById('addUserBtn');
      if (addUserBtn) {
        addUserBtn.style.display = currentUserPermissions.canAdd ? 'inline-block' : 'none';
      }

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
      const canUpdate = currentUserPermissions.canUpdate;
      const canDelete = currentUserPermissions.canDelete;
      const canDisable = currentUserPermissions.canDisable;


      userCard.innerHTML = `
        <form data-uid="${uid}">
          <label>First Name: <input type="text" name="firstName" value="${data.firstName}" ${!canUpdate ? 'disabled' : ''} /></label><br>
          <label>Middle Name: <input type="text" name="middleName" value="${data.middleName}" ${!canUpdate ? 'disabled' : ''} /></label><br>
          <label>Last Name: <input type="text" name="lastName" value="${data.lastName}" ${!canUpdate ? 'disabled' : ''} /></label><br>
          <label>Email: <input type="email" value="${data.email}" disabled /></label><br>
          <label>Role:
            <select name="role" ${!canUpdate ? "disabled" : ""}>
              <option value="Super Admin" ${data.role === 'Super Admin' ? 'selected' : ''}>Super Admin</option>
              <option value="Admin" ${data.role === 'Admin' ? 'selected' : ''}>Admin</option>
              <option value="User" ${data.role === 'User' ? 'selected' : ''}>User</option>
            </select>
          </label><br>

          ${data.permissions ? `
            <fieldset>
              <legend>Permissions:</legend>
              <label><input type="checkbox" name="canAdd" ${data.permissions.canAdd ? 'checked' : ''}> Add</label>
              <label><input type="checkbox" name="canUpdate" ${data.permissions.canUpdate ? 'checked' : ''}> Update</label>
              <label><input type="checkbox" name="canDisable" ${data.permissions.canDisable ? 'checked' : ''}> Disable</label>
              <label><input type="checkbox" name="canDelete" ${data.permissions.canDelete ? 'checked' : ''}> Delete</label>
            </fieldset>
          ` : ''}

          ${canDisable ? `<button type="button" class="disable-btn">Disable</button>` : ""}
          ${canDelete ? `<button type="button" class="delete-btn">Delete</button>` : ""}
          ${canUpdate ? `<button type="submit">Update</button>` : ""}
        </form>
        <hr>
      `;
      userListDiv.appendChild(userCard);

      const form = userCard.querySelector("form");

      if (canDisable) {
        userCard.querySelector(".disable-btn").addEventListener("click", async () => {
          try {
           await updateDoc(doc(db, "users", uid), { disabled: true });
           await logAction(user.email, "disable_user", "User disabled.", `Disabled user: ${data.email}`);
           alert("User disabled.");

          } catch (err) {
            console.error("Disable failed:", err);
            alert("Error disabling user.");
          }
        });
      }

      if (canDelete) {
        userCard.querySelector(".delete-btn").addEventListener("click", async () => {
          if (!confirm("Are you sure you want to delete this user?")) return;
          try {
            await deleteDoc(doc(db, "users", uid));
            await logAction(user.email, "delete_user", "User deleted.", `Deleted user: ${data.email}`);
            alert("User deleted.");
            window.location.reload();
          } catch (err) {
            console.error("Delete failed:", err);
            alert("Error deleting user.");
          }
        });
      }

      // Update user data
      if (canUpdate) {
        form.addEventListener("submit", async (e) => {
          e.preventDefault();
          const updatedData = {
            firstName: form.firstName.value,
            middleName: form.middleName.value,
            lastName: form.lastName.value,
            role: form.role.value,
            permissions: {
              canAdd: form.canAdd?.checked || false,
              canUpdate: form.canUpdate?.checked || false,
              canDisable: form.canDisable?.checked || false,
              canDelete: form.canDelete?.checked || false
            }
          };

          try {
            await updateDoc(doc(db, "users", uid), updatedData);
            await logAction(user.email, "update_user", "User updated successfully!", `Updated user: ${form.firstName.value} ${form.lastName.value}`);
            alert("User updated successfully!");
          } catch (err) {
            console.error("Error updating user:", err);
            alert("Failed to update user.");
          }
        });
      }
    });
  }

  async function logAction(userEmail, action, status, details) {
    try {
      await addDoc(collection(db, "logs"), {
        timestamp: new Date(),
        action: action,
        user_email: userEmail,
        status: status,
        details: details
      });
      console.log("Action logged:", action);
    } catch (error) {
      console.error("Error logging action:", error);
    }
  }
});

// Firebase initialization should already be done before this script

document.addEventListener('DOMContentLoaded', function () {
    const db = firebase.firestore();
    const usersTable = document.getElementById('usersTable').getElementsByTagName('tbody')[0];

    // Get current signed-in user
    function getCurrentUser() {
        return firebase.auth().currentUser;
    }

    // Log administrative actions to Firestore 'logs' collection
    function logAction(userEmail, action, status, details) {
        db.collection('logs').add({
           timestamp: new Date(),
           action: action,
           user_email: userEmail,
           status: status,
           details: details
        })
        .then(() => {
            console.log('Action logged:', action);
        })
        .catch((error) => {
            console.error('Error logging action:', error);
        });
    }

    // Fetch and display users
    db.collection('users').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const user = doc.data();
            const row = usersTable.insertRow();

            row.insertCell(0).innerText = user.firstName || '';
            row.insertCell(1).innerText = user.middleName || '';
            row.insertCell(2).innerText = user.lastName || '';
            row.insertCell(3).innerText = user.email || '';
            row.insertCell(4).innerText = user.role || '';

            // Action Buttons
            const actionsCell = row.insertCell(5);

            // Disable Button
            const disableBtn = document.createElement('button');
            disableBtn.innerText = 'Disable';
            disableBtn.classList.add('btn', 'btn-warning', 'm-1');
            disableBtn.addEventListener('click', () => {
                const currentUser = getCurrentUser();
                if (!currentUser) {
                    alert('You must be signed in to perform this action.');
                    return;
                }

                db.collection('users').doc(doc.id).update({ disabled: true })
                    .then(() => {
                        alert('User disabled successfully');
                        logAction(currentUser.email, 'disable_user', doc.id, `Disabled user: ${user.email}`);
                        location.reload();
                    })
                    .catch((error) => {
                        alert('Error disabling user: ' + error.message);
                    });
            });
            actionsCell.appendChild(disableBtn);

            // Delete Button
            const deleteBtn = document.createElement('button');
            deleteBtn.innerText = 'Delete';
            deleteBtn.classList.add('btn', 'btn-danger', 'm-1');
            deleteBtn.addEventListener('click', () => {
                const currentUser = getCurrentUser();
                if (!currentUser) {
                    alert('You must be signed in to perform this action.');
                    return;
                }

                if (confirm('Are you sure you want to delete this user?')) {
                    db.collection('users').doc(doc.id).delete()
                        .then(() => {
                            alert('User deleted successfully');
                            logAction(currentUser.email, 'delete_user', doc.id, `Deleted user: ${user.email}`);
                            location.reload();
                        })
                        .catch((error) => {
                            alert('Error deleting user: ' + error.message);
                        });
                }
            });
            actionsCell.appendChild(deleteBtn);

            // Update Role Button (as example for update)
            const updateBtn = document.createElement('button');
            updateBtn.innerText = 'Update Role';
            updateBtn.classList.add('btn', 'btn-info', 'm-1');
            updateBtn.addEventListener('click', () => {
                const currentUser = getCurrentUser();
                if (!currentUser) {
                    alert('You must be signed in to perform this action.');
                    return;
                }

                const newRole = prompt('Enter new role:', user.role);
                if (newRole && newRole !== user.role) {
                    db.collection('users').doc(doc.id).update({ role: newRole })
                        .then(() => {
                            alert('User role updated successfully');
                            logAction(currentUser.email, 'update_user', doc.id, `Updated role of user ${user.email} to ${newRole}`);
                            location.reload();
                        })
                        .catch((error) => {
                            alert('Error updating role: ' + error.message);
                        });
                }
            });
            actionsCell.appendChild(updateBtn);
        });
    });
});