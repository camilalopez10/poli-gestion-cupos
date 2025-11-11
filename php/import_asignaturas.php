<?php
require_once __DIR__.'/conexion.php';
header('Content-Type: application/json; charset=utf-8');
if(!isset($_FILES['file'])){ echo json_encode(['error'=>'no file']); exit; }
$f = fopen($_FILES['file']['tmp_name'],'r');
$header = fgetcsv($f);
$inserted=0;
while(($row=fgetcsv($f))!==false){
  $codigo = $conn->real_escape_string($row[0] ?? '');
  $nombre = $conn->real_escape_string($row[1] ?? '');
  $creditos = intval($row[2] ?? 0);
  $stmt = $conn->prepare('INSERT INTO asignaturas (codigo,nombre,creditos) VALUES (?,?,?)');
  $stmt->bind_param('ssi',$codigo,$nombre,$creditos);
  $stmt->execute(); $inserted++;
}
echo json_encode(['ok'=>true,'inserted'=>$inserted,'msg'=>'Import OK']);
?>