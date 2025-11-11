<?php
require_once __DIR__.'/conexion.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['ok'=>false,'msg'=>'Method not allowed']); exit;
}
$nombre = trim($_POST['nombre'] ?? '');
$correo = trim($_POST['correo'] ?? '');
$pass = $_POST['password'] ?? '';
$rol = $_POST['rol'] ?? 'coordinador';
if (!preg_match('/@elpoli\.edu\.co$/', $correo)) {
    echo json_encode(['ok'=>false,'msg'=>'El correo debe finalizar en @elpoli.edu.co']); exit;
}
$hash = password_hash($pass, PASSWORD_DEFAULT);
$stmt = $conn->prepare('INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)');
$stmt->bind_param('ssss', $nombre, $correo, $hash, $rol);
try {
    $stmt->execute();
    echo json_encode(['ok'=>true,'msg'=>'Usuario creado']);
} catch (Exception $e) {
    echo json_encode(['ok'=>false,'msg'=>'Error: '.$e->getMessage()]);
}
?>