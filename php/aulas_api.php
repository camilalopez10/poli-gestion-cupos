<?php
require_once __DIR__.'/conexion.php';
require_once __DIR__.'/historial_log.php';
header('Content-Type: application/json; charset=utf-8');
$action = $_REQUEST['action'] ?? 'list';
if($action=='list'){
    $res = $conn->query('SELECT * FROM aulas ORDER BY id DESC');
    $out = []; while($r=$res->fetch_assoc()) $out[]=$r; echo json_encode($out); exit;
}
if($action=='create'){
    $nombre=$conn->real_escape_string($_POST['nombre']); $cap = intval($_POST['capacidad']); $ubic = $conn->real_escape_string($_POST['ubicacion']); $tipo = $conn->real_escape_string($_POST['tipo']);
    $stmt=$conn->prepare('INSERT INTO aulas (nombre,capacidad,ubicacion,tipo) VALUES (?,?,?,?)'); $stmt->bind_param('siss',$nombre,$cap,$ubic,$tipo); $stmt->execute(); log_change($conn, null, 'aulas', 'CREATE', "Aula creada {$nombre}"); echo json_encode(['ok'=>true]); exit;
}
if($action=='delete'){ $id=intval($_POST['id']); $stmt=$conn->prepare('DELETE FROM aulas WHERE id=?'); $stmt->bind_param('i',$id); $stmt->execute(); log_change($conn,null,'aulas','DELETE',"Eliminada aula id={$id}"); echo json_encode(['ok'=>true]); exit; }
echo json_encode(['error'=>'action not supported']);