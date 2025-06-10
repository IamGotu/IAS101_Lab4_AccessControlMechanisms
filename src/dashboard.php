<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
    <title>Dashboard</title>

    <!-- CSS files -->
    <link rel="stylesheet" href="../css/dashboard.css" />
    <link rel="stylesheet" href="../css/sidebar.css" />

    <!-- JavaScript -->
    <script type="module" src="../js/dashboard.js"></script>
</head>
<body>
    <?php include '../includes/sidebar.php'; ?>
    <div class="main-content" style="margin-left: 270px; padding: 20px;">
        <h1>Welcome to the Dashboard</h1>

        <div class="mfa-toggle">
            <label>
                <input type="checkbox" id="mfaToggle" />
                Enable Multi-Factor Authentication (MFA)
            </label>
        </div>

    </div>
</body>
</html>