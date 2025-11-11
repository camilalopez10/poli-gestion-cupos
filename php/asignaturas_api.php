<?php
require_once __DIR__.'/conexion.php';
require_once __DIR__.'/historial_log.php';
header('Content-Type: application/json; charset=utf-8');
$action = $_REQUEST['action'] ?? 'list';
if($action=='list'){
    $res = $conn->query('SELECT * FROM asignaturas ORDER BY id DESC');
    $out = []; while($r=$res->fetch_assoc()) $out[]=$r; echo json_encode($out); exit;
}
if($action=='create'){
    $codigo = $conn->real_escape_string($_POST['codigo']);
    $nombre = $conn->real_escape_string($_POST['nombre']);
    $creditos = intval($_POST['creditos']);
    $stmt = $conn->prepare('INSERT INTO asignaturas (codigo,nombre,creditos) VALUES (?,?,?)');
    $stmt->bind_param('ssi',$codigo,$nombre,$creditos); $ok=$stmt->execute(); $id=$stmt->insert_id; $stmt->close();
    log_change($conn, null, 'asignaturas', 'CREATE', "Creada asignatura id={$id}");
    echo json_encode(['ok'=>$ok,'id'=>$id]); exit;
}
if($action=='update'){
    $id = intval($_POST['id']); $codigo = $conn->real_escape_string($_POST['codigo']); $nombre = $conn->real_escape_string($_POST['nombre']); $creditos = intval($_POST['creditos']);
    $stmt = $conn->prepare('UPDATE asignaturas SET codigo=?, nombre=?, creditos=? WHERE id=?'); $stmt->bind_param('ssii',$codigo,$nombre,$creditos,$id); $ok=$stmt->execute(); $stmt->close();
    log_change($conn, null, 'asignaturas', 'UPDATE', "Actualizada asignatura id={$id}");
    echo json_encode(['ok'=>$ok]); exit;
}
if($action=='delete'){
    $id = intval($_POST['id']); $stmt = $conn->prepare('DELETE FROM asignaturas WHERE id=?'); $stmt->bind_param('i',$id); $ok=$stmt->execute(); $stmt->close();
    log_change($conn, null, 'asignaturas', 'DELETE', "Eliminada asignatura id={$id}");
    echo json_encode(['ok'=>$ok]); exit;
}
echo json_encode(['error'=>'action not supported']);