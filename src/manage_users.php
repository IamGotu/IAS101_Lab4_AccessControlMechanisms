<?php
session_start();

if (!isset($_SESSION['userRole']) || 
   ($_SESSION['userRole'] !== 'Admin' && $_SESSION['userRole'] !== 'Super Admin')) {
    // Unauthorized access - redirect to dashboard or login
    header('Location: dashboard.php');
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Manage Users</title>
    <link rel="stylesheet" href="../css/manage_users.css">

    <script type="module" src="../js/manage_users.js"></script>
</head>
<body>
    <?php include '../includes/sidebar.php'; ?>
    <link rel="stylesheet" href="../css/sidebar.css" />

    <div class="main-content">

        <h1>Manage Users</h1>

        <button id="addUserBtn" class="btn btn-primary">Add User</button>

        <div id="userList">Loading users...</div>
    </div>
</body>
</html>