<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Firebase MFA</title>
    <link rel="stylesheet" href="../css/styles.css">
    <script type="module" src="../js/firebaseAuth.js"></script>
</head>
<body>
    <div class="container">
        <div class="slider"></div>
        <div class="btn">
            <button class="login">Login</button>
            <button class="signup">Signup</button>
        </div>
        <div class="form-section">
            <div class="login-box">
                <input type="email" class="email ele" id="lemail" placeholder="Youremail@email.com">
                <input type="password" class="password ele" id="lpassword" placeholder="Password">
                <button class="clkbtn" id="login">Login</button>
                <div id="loginMessage" class="messageDiv"></div>
            </div>
            <div class="signup-box">
                <input type="text" class="name ele" id="first_name" placeholder="First Name">
                <input type="text" class="name ele" id="middle_name" placeholder="Middle Name">
                <input type="text" class="name ele" id="last_name" placeholder="Last Name">
                <input type="email" class="email ele" id="remail" placeholder="Youremail@email.com">
                <input type="password" class="password ele" id="rpassword" placeholder="Password">
                <button class="clkbtn" id="signup">Signup</button>
                <div id="signUpMessage" class="messageDiv"></div>
            </div>
        </div>
        <div id="recaptcha-container"></div>
    </div>
    <script src="../js/script.js"></script>
</body>
</html>