<?php
require_once __DIR__.'/conexion.php';
header('Content-Type: application/json; charset=utf-8');
if(!isset($_FILES['file'])){ echo json_encode(['error'=>'no file']); exit; }
$f = fopen($_FILES['file']['tmp_name'],'r');
$header = fgetcsv($f);
$inserted=0;
while(($row=fgetcsv($f))!==false){
  $nombre = $conn->real_escape_string($row[0] ?? '');
  $capacidad = intval($row[1] ?? 0);
  $ubicacion = $conn->real_escape_string($row[2] ?? '');
  $tipo = $conn->real_escape_string($row[3] ?? '');
  $stmt = $conn->prepare('INSERT INTO aulas (nombre,capacidad,ubicacion,tipo) VALUES (?,?,?,?)');
  $stmt->bind_param('siss',$nombre,$capacidad,$ubicacion,$tipo);
  $stmt->execute(); $inserted++;
}
echo json_encode(['ok'=>true,'inserted'=>$inserted,'msg'=>'Import OK']);
?>