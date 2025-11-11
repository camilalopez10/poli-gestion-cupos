<?php
require_once '../../class/conexion.php';
require_once '../../class/historial_log.php';
session_start();
header('Content-Type: application/json');

$action = $_REQUEST['action'] ?? '';

if($action == 'list') {
  $res = $conn->query("SELECT id,codigo,nombre,creditos FROM asignaturas ORDER BY id DESC");
  $rows = [];
  while($r = $res->fetch_assoc()) $rows[] = $r;
  echo json_encode($rows);
  exit;
}

if($action == 'create') {
  $codigo = $conn->real_escape_string($_POST['codigo']);
  $nombre = $conn->real_escape_string($_POST['nombre']);
  $creditos = intval($_POST['creditos']);

  $stmt = $conn->prepare("INSERT INTO asignaturas (codigo,nombre,creditos) VALUES (?,?,?)");
  $stmt->bind_param("ssi",$codigo,$nombre,$creditos);
  $ok = $stmt->execute();
  $id = $stmt->insert_id;
  $stmt->close();

  log_change($conn, $_SESSION['user_id'] ?? null, 'asignaturas', 'CREATE', "Asignatura $codigo - $nombre creada");
  echo json_encode(['ok'=>$ok,'id'=>$id]);
  exit;
}

if($action == 'update') {
  $id = intval($_POST['id']);
  $codigo = $conn->real_escape_string($_POST['codigo']);
  $nombre = $conn->real_escape_string($_POST['nombre']);
  $creditos = intval($_POST['creditos']);
  $stmt = $conn->prepare("UPDATE asignaturas SET codigo=?, nombre=?, creditos=? WHERE id=?");
  $stmt->bind_param("ssii",$codigo,$nombre,$creditos,$id);
  $ok = $stmt->execute();
  $stmt->close();
  log_change($conn, $_SESSION['user_id'] ?? null, 'asignaturas', 'UPDATE', "Asignatura id=$id actualizada");
  echo json_encode(['ok'=>$ok]);
  exit;
}

if($action == 'delete') {
  $id = intval($_POST['id']);
  $stmt = $conn->prepare("DELETE FROM asignaturas WHERE id=?");
  $stmt->bind_param("i",$id);
  $ok = $stmt->execute();
  $stmt->close();
  log_change($conn, $_SESSION['user_id'] ?? null, 'asignaturas', 'DELETE', "Asignatura id=$id eliminada");
  echo json_encode(['ok'=>$ok]);
  exit;
}

echo json_encode(['error'=>'action no soportada']);
?>