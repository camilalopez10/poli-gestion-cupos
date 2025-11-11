<?php
require_once __DIR__ . '/conexion.php'; 

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $correo = $conn->real_escape_string($_POST['correo']);
    $pass = $_POST['password'];

    $res = $conn->query("SELECT * FROM usuarios WHERE correo = '$correo' LIMIT 1");

    if ($res && $u = $res->fetch_assoc()) {
      
        if ($pass === $u['password'] || password_verify($pass, $u['password'])) {
            $_SESSION['user'] = [
                'id' => $u['id'],
                'nombre' => $u['nombre'],
                'rol' => $u['rol']
            ];
            echo json_encode(['ok' => true]);
            exit;
        }
    }

    echo json_encode(['ok' => false, 'error' => 'Credenciales inválidas']);
    exit;
}
?>
