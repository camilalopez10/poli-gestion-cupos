<?php
header('Content-Type: application/json');
require_once __DIR__ . '/conexion.php';
require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../mail_config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$input = json_decode(file_get_contents('php://input'), true);
$correo = $conn->real_escape_string($input['correo'] ?? '');

$res = $conn->prepare("SELECT id, nombre FROM usuarios WHERE correo=? LIMIT 1");
$res->bind_param('s', $correo);
$res->execute();
$result = $res->get_result();

if ($result && $result->num_rows > 0) {
    $u = $result->fetch_assoc();

    // Generar token y fecha de expiración
    $token = bin2hex(random_bytes(16));
    $exp = date('Y-m-d H:i:s', strtotime('+24 hours'));

    // Guardar token
    $ins = $conn->prepare("INSERT INTO reset_tokens (correo, token, fecha_expira) VALUES (?, ?, ?)");
    $ins->bind_param('sss', $correo, $token, $exp);
    $ins->execute();

    // Enlace de restablecimiento
    $url = "http://localhost/poli-gestion-cupos/php/nueva_contrasena.php?token=" . urlencode($token);

    // Enviar correo con PHPMailer
    $mail = new PHPMailer(true);
    try {
        global $SMTP_HOST, $SMTP_USER, $SMTP_PASS, $SMTP_PORT, $SMTP_FROM, $SMTP_FROM_NAME;

        $mail->isSMTP();
        $mail->Host       = $SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = $SMTP_USER;
        $mail->Password   = $SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = $SMTP_PORT;

        $mail->setFrom($SMTP_FROM, $SMTP_FROM_NAME);
        $mail->addAddress($correo, $u['nombre']);
        $mail->isHTML(false);
        $mail->Subject = 'Restablecimiento de contraseña - Poli JIC';
        $mail->Body    = "Hola {$u['nombre']},\n\n"
                        . "Para restablecer tu contraseña, haz clic en el siguiente enlace:\n{$url}\n\n"
                        . "Este enlace expirará en 24 horas.\n\n"
                        . "Si no solicitaste este cambio, ignora este mensaje.";

        $mail->send();
        $response = ['success' => true, 'message' => 'Correo enviado correctamente'];
    } catch (Exception $e) {
        $response = ['success' => false, 'error' => "No se pudo enviar el correo: {$mail->ErrorInfo}"];
    }
} else {
    // No revelar si el correo existe o no
    $response = ['success' => true];
}

echo json_encode($response);
?>
