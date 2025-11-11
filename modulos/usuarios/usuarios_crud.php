<?php
require_once '../../class/conexion.php';
require_once '../../class/historial_log.php';
session_start();
header('Content-Type: application/json');

$action = $_REQUEST['action'] ?? '';

if($action == 'list') {
  $res = $conn->query("SELECT id,nombre,email,rol FROM usuarios ORDER BY id DESC");
  $rows = [];
  while($r = $res->fetch_assoc()) $rows[] = $r;
  echo json_encode($rows);
  exit;
}

if($action == 'create') {
  $nombre = $conn->real_escape_string($_POST['nombre']);
  $email = $conn->real_escape_string($_POST['email']);
  $pass = password_hash($_POST['password'], PASSWORD_DEFAULT);
  $rol = $conn->real_escape_string($_POST['rol']);

  $stmt = $conn->prepare("INSERT INTO usuarios (nombre,email,password,rol) VALUES (?,?,?,?)");
  $stmt->bind_param("ssss",$nombre,$email,$pass,$rol);
  $ok = $stmt->execute();
  $id = $stmt->insert_id;
  $stmt->close();

  log_change($conn, $_SESSION['user_id'] ?? null, 'usuarios', 'CREATE', "Usuario $email creado");
  echo json_encode(['ok'=>$ok,'id'=>$id]);
  exit;
}

if($action == 'update') {
  $id = intval($_POST['id']);
  $nombre = $conn->real_escape_string($_POST['nombre']);
  $rol = $conn->real_escape_string($_POST['rol']);
  $stmt = $conn->prepare("UPDATE usuarios SET nombre=?, rol=? WHERE id=?");
  $stmt->bind_param("ssi",$nombre,$rol,$id);
  $ok = $stmt->execute();
  $stmt->close();
  log_change($conn, $_SESSION['user_id'] ?? null, 'usuarios', 'UPDATE', "Usuario id=$id actualizado");
  echo json_encode(['ok'=>$ok]);
  exit;
}

if($action == 'delete') {
  $id = intval($_POST['id']);
  $stmt = $conn->prepare("DELETE FROM usuarios WHERE id=?");
  $stmt->bind_param("i",$id);
  $ok = $stmt->execute();
  $stmt->close();
  log_change($conn, $_SESSION['user_id'] ?? null, 'usuarios', 'DELETE', "Usuario id=$id eliminado");
  echo json_encode(['ok'=>$ok]);
  exit;
}

echo json_encode(['error'=>'action no soportada']);
?>