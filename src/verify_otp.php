<?php
session_start();

// Redirect if email is not set
if (!isset($_SESSION['email'])) {
    $_SESSION['error'] = "Session expired. Please log in again.";
    header("Location: login_sign_up.php");
    exit();
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isset($_POST['otp']) || !isset($_SESSION['otp'])) {
        $_SESSION['error'] = "Session expired or invalid request.";
        header("Location: verify_otp.php");
        exit();
    }

    $enteredOtp = trim($_POST['otp']);
    $storedOtp = $_SESSION['otp'];

    if ($enteredOtp === $storedOtp) {
        unset($_SESSION['otp']);
        header("Location: dashboard.php");
        exit();
    } else {
        $_SESSION['error'] = "Invalid OTP. Please try again.";
        header("Location: verify_otp.php");
        exit();
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>MFA Verification</title>
    <link rel="stylesheet" href="../css/verify_otp.css">
</head>
<body>
    <h2>Multi-Factor Authentication</h2>
    <p>An OTP has been sent to your email: <strong><?php echo htmlspecialchars($_SESSION['email']); ?></strong></p>

    <form method="post" action="verify_otp.php">
        <label for="otp">Enter OTP:</label>
        <input type="text" name="otp" id="otp" required pattern="\d{6}" maxlength="6">
        <button type="submit">Verify</button>
    </form>

    <?php if (isset($_SESSION['error'])): ?>
        <p style="color:red;"><?php echo htmlspecialchars($_SESSION['error']); unset($_SESSION['error']); ?></p>
    <?php endif; ?>
</body>
</html>
