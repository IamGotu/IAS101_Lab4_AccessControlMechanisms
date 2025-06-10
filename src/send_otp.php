<?php
session_start();

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
require 'vendor/autoload.php';

$data = json_decode(file_get_contents("php://input"), true);
$email = $data['email'] ?? null;

if (!$email) {
    echo json_encode(['success' => false, 'message' => 'Email is required']);
    exit;
}

$otp = strval(rand(100000, 999999));
$_SESSION['email'] = $email;
$_SESSION['otp'] = $otp;

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'cocnambawan@gmail.com';
    $mail->Password   = 'sons pssa usnc opaz';
    $mail->SMTPSecure = 'tls';
    $mail->Port       = 587;

    $mail->setFrom('cocnambawan@gmail.com', 'OTP');
    $mail->addAddress($email);
    $mail->Subject = 'Your OTP Code';
    $mail->Body    = "Your OTP is: $otp";

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'OTP sent']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $mail->ErrorInfo]);
}
?>
