<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Access Logs - Admin Dashboard</title>
    <link rel="stylesheet" href="../css/logs.css" />
    <script type="module" src="../js/logs.js"></script>
</head>
<body>
    <?php include '../includes/sidebar.php'; ?>
    <link rel="stylesheet" href="../css/sidebar.css" />

    <div class="main-content">
        <h1>System Access Logs</h1>

        <!-- Optional Filter Bar -->
        <div class="filter-bar">
            <input type="text" id="searchUser" placeholder="Search by user email...">
            <select id="filterType">
                <option value="">All Types</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="update">Update</option>
                <option value="unauthorized">Unauthorized Access</option>
            </select>
        </div>

        <div id="logsContainer"></div>
    </div>
</body>
</html>