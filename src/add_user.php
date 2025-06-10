<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <link rel="stylesheet" href="../css/add_user.css">
  <title>Add User</title>
  <script type="module" src="../js/add_user.js"></script>
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