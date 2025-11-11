<?php
include('conexion.php');

if($_SERVER['REQUEST_METHOD'] === 'GET'){
    $token = $_GET['token'] ?? '';
    ?>
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Nueva contraseña</title>
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
        <h3>Crear nueva contraseña</h3>
        <form method="POST">
            <input type="hidden" name="token" value="<?php echo htmlspecialchars($token); ?>">
            <input type="password" name="password" placeholder="Nueva contraseña" required>
            <input type="password" name="password2" placeholder="Confirmar contraseña" required>
            <button type="submit">Actualizar contraseña</button>
        </form>
    </div>
    </body>
    </html>
    <?php
    exit;
}

// Procesar POST
$token = $conn->real_escape_string($_POST['token'] ?? '');
$pass = $_POST['password'] ?? '';
$pass2 = $_POST['password2'] ?? '';

// Validar contraseñas
if($pass !== $pass2){
    echo '<p class="error">Las contraseñas no coinciden.</p>';
    exit;
}

// Buscar token
$res = $conn->query("SELECT correo, fecha_expira FROM reset_tokens WHERE token='$token' LIMIT 1");
if(!$res || $res->num_rows==0){
    echo '<p class="error">Token inválido o expirado.</p>';
    exit;
}

$row = $res->fetch_assoc();
if(strtotime($row['fecha_expira']) < time()){
    echo '<p class="error">Token expirado.</p>';
    exit;
}

$correo = $conn->real_escape_string($row['correo']);

// Actualizar contraseña (hash recomendado)
$pass_hash = password_hash($pass, PASSWORD_DEFAULT);
$conn->query("UPDATE usuarios SET password='$pass_hash' WHERE correo='$correo'");

// Eliminar token usado
$conn->query("DELETE FROM reset_tokens WHERE token='$token'");

echo '<p class="success">Contraseña actualizada correctamente.</p>';
echo '<p><a href="../index.html">Ir al login</a></p>';
?>
