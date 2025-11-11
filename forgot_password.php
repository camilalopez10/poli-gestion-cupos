<?php
require_once __DIR__.'/php/conexion.php';  // ✅ Conexión a tu BD
require_once __DIR__.'/vendor/autoload.php'; // Autoload de Composer

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $email = filter_var($_POST['email'], FILTER_VALIDATE_EMAIL);

    if(!$email){
        $error = "Email inválido.";
    } else {
        // Validar dominio institucional
        if (substr(strtolower($email), -strlen('@elpoli.edu.co')) !== '@elpoli.edu.co') {
            $error = "Solo se permiten correos institucionales con el dominio @elpoli.edu.co.";
        } else {
            // Buscar usuario
            $stmt = $conn->prepare("SELECT id, nombre FROM usuarios WHERE correo = ? LIMIT 1");
            $stmt->bind_param('s', $email);
            $stmt->execute();
            $res = $stmt->get_result();

            if($res->num_rows == 0){
                // Mensaje genérico
                $msg = "Si existe ese correo institucional, recibirá instrucciones por email.";
            } else {
                $u = $res->fetch_assoc();

                // Generar token
                $token = bin2hex(random_bytes(32));
                $expires = date('Y-m-d H:i:s', time() + 3600);

                // Guardar token en BD
                $ins = $conn->prepare("INSERT INTO reset_tokens (correo, token, fecha_expira) VALUES (?, ?, ?)");
                $ins->bind_param('sss', $email, $token, $expires);
                $ins->execute();

                // Enlace de restablecimiento
                $reset_link = "http://localhost/poli-gestion-cupos/php/nueva_contrasena.php?token=".$token;

                // Configurar PHPMailer
                require_once __DIR__.'/mail_config.php';
                $mail = new PHPMailer(true);

                try {
                    $mail->isSMTP();
                    $mail->Host       = $SMTP_HOST;
                    $mail->SMTPAuth   = true;
                    $mail->Username   = $SMTP_USER;
                    $mail->Password   = $SMTP_PASS;
                    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // TLS
                    $mail->Port       = $SMTP_PORT;

                    $mail->setFrom($SMTP_FROM, $SMTP_FROM_NAME);
                    $mail->addAddress($email, $u['nombre']);

                    $mail->isHTML(false);
                    $mail->Subject = 'Restablecer contraseña';
                    $mail->Body = "Hola {$u['nombre']},\n\nPara restablecer su contraseña haga clic en el siguiente enlace:\n{$reset_link}\n\nSi no solicitó este correo, ignore este mensaje.";

                    $mail->send();
                    $msg = "Si existe ese correo institucional, recibirá instrucciones por email.";
                } catch (Exception $e) {
                    $error = "No se pudo enviar el correo: {$mail->ErrorInfo}";
                }
            }
        }
    }
}
?>
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Olvidé mi contraseña</title>
<style>
body { font-family: Arial, sans-serif; background: #f7f7f7; display:flex; justify-content:center; align-items:center; height:100vh; }
.form-box { background:white; padding:30px; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.1); width:320px; }
input { width:100%; padding:10px; margin:8px 0; border:1px solid #ccc; border-radius:5px; }
button { background:#2E7D32; color:white; border:none; padding:10px 15px; border-radius:5px; cursor:pointer; width:100%; }
button:hover { background:#1B5E20; }
.error { color:red; }
.success { color:green; }
</style>
</head>
<body>
<div class="form-box">
<h3>Restablecer contraseña</h3>
<?php if(!empty($error)) echo "<p class='error'>$error</p>"; ?>
<?php if(!empty($msg)) echo "<p class='success'>$msg</p>"; ?>
<form method="post">
  <label>Correo institucional:</label>
  <input type="email" name="email" required pattern="[a-zA-Z0-9._%+-]+@elpoli\.edu\.co$" placeholder="usuario@elpoli.edu.co">
  <button type="submit">Enviar instrucciones</button>
</form>
</div>
</body>
</html>
