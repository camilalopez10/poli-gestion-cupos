<?php
require_once __DIR__ . '/../../php/conexion.php';

$msg = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nombre = trim($_POST['nombre'] ?? '');
    $correo = strtolower(trim($_POST['correo'] ?? ''));
    $password = $_POST['password'] ?? '';
    $rol = strtoupper(trim($_POST['rol'] ?? 'ACADEMICO'));

    if (!preg_match('/^[a-zA-Z0-9._%+-]+@elpoli\.edu\.co$/', $correo)) {
        $msg = "⚠️ Solo se permiten correos institucionales @elpoli.edu.co";
    } else {
        // Verificar duplicado
        $stmt = $conn->prepare("SELECT id FROM usuarios WHERE correo = ?");
        $stmt->bind_param("s", $correo);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res->num_rows > 0) {
            $msg = "⚠️ El correo ya está registrado.";
        } else {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $conn->prepare("INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssss", $nombre, $correo, $hash, $rol);
            if ($stmt->execute()) {
                $msg = "✅ Usuario creado correctamente.";
            } else {
                $msg = "❌ Error al crear el usuario.";
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Crear Usuario</title>
<style>
body {
  font-family: Arial, sans-serif;
  background: #f7f7f7;
  padding: 40px;
}
.container {
  max-width: 400px;
  margin: auto;
  background: #fff;
  padding: 25px 30px;
  border-radius: 10px;
  box-shadow: 0 6px 15px rgba(0,0,0,0.1);
}
h2 { color: #2E7D32; }
label { display:block; margin-top:12px; color:#333; }
input, select {
  width:100%;
  padding:10px;
  border:1px solid #ccc;
  border-radius:6px;
  margin-top:4px;
}
button {
  margin-top:15px;
  background:#2E7D32;
  color:white;
  border:none;
  padding:10px 14px;
  border-radius:6px;
  cursor:pointer;
  width:100%;
  transition:background 0.3s;
}
button:hover { background:#1B5E20; }
.msg {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 6px;
  background: #e8f5e9;
  color: #2E7D32;
  font-weight: bold;
}
.msg.error {
  background: #ffebee;
  color: #b71c1c;
}
</style>
</head>
<body>

<div class="container">
  <h2>Crear Usuario</h2>

  <?php if ($msg): ?>
    <div class="msg <?= strpos($msg, '⚠️') || strpos($msg, '❌') ? 'error' : '' ?>">
      <?= htmlspecialchars($msg) ?>
    </div>
  <?php endif; ?>

  <form method="post" action="">
    <label>Nombre</label>
    <input name="nombre" required>

    <label>Correo institucional</label>
    <input name="correo" type="email" placeholder="usuario@elpoli.edu.co" required>

    <label>Contraseña</label>
    <input name="password" type="password" required>

    <label>Rol</label>
    <select name="rol" required>
      <option value="ADMIN">ADMIN</option>
      <option value="ACADEMICO">ACADEMICO</option>
    </select>

    <button type="submit">Crear usuario</button>
  </form>
</div>

</body>
</html>
