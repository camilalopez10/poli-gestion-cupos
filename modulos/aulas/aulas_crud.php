<?php
require_once '../../class/conexion.php';
require_once '../../class/historial_log.php';
session_start();
header('Content-Type: application/json');

$action = $_REQUEST['action'] ?? '';

if($action == 'list') {
  $res = $conn->query("SELECT id,nombre,capacidad,tipo FROM aulas ORDER BY id DESC");
  $rows = [];
  while($r = $res->fetch_assoc()) $rows[] = $r;
  echo json_encode($rows);
  exit;
}

if($action == 'create') {
  $nombre = $conn->real_escape_string($_POST['nombre']);
  $capacidad = intval($_POST['capacidad']);
  $tipo = $conn->real_escape_string($_POST['tipo']);

  $stmt = $conn->prepare("INSERT INTO aulas (nombre,capacidad,tipo) VALUES (?,?,?)");
  $stmt->bind_param("sis",$nombre,$capacidad,$tipo);
  $ok = $stmt->execute();
  $id = $stmt->insert_id;
  $stmt->close();

  log_change($conn, $_SESSION['user_id'] ?? null, 'aulas', 'CREATE', "Aula $nombre creada");
  echo json_encode(['ok'=>$ok,'id'=>$id]);
  exit;
}

if($action == 'update') {
  $id = intval($_POST['id']);
  $nombre = $conn->real_escape_string($_POST['nombre']);
  $capacidad = intval($_POST['capacidad']);
  $tipo = $conn->real_escape_string($_POST['tipo']);
  $stmt = $conn->prepare("UPDATE aulas SET nombre=?, capacidad=?, tipo=? WHERE id=?");
  $stmt->bind_param("sisi",$nombre,$capacidad,$tipo,$id);
  $ok = $stmt->execute();
  $stmt->close();
  log_change($conn, $_SESSION['user_id'] ?? null, 'aulas', 'UPDATE', "Aula id=$id actualizada");
  echo json_encode(['ok'=>$ok]);
  exit;
}

if($action == 'delete') {
  $id = intval($_POST['id']);
  $stmt = $conn->prepare("DELETE FROM aulas WHERE id=?");
  $stmt->bind_param("i",$id);
  $ok = $stmt->execute();
  $stmt->close();
  log_change($conn, $_SESSION['user_id'] ?? null, 'aulas', 'DELETE', "Aula id=$id eliminada");
  echo json_encode(['ok'=>$ok]);
  exit;
}

echo json_encode(['error'=>'action no soportada']);
?>