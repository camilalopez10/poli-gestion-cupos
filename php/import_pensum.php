<?php
require_once __DIR__.'/conexion.php';
header('Content-Type: application/json; charset=utf-8');
if(!isset($_FILES['file'])){ echo json_encode(['error'=>'no file']); exit; }
$f = fopen($_FILES['file']['tmp_name'],'r');
$header = fgetcsv($f);
$inserted=0;
while(($row=fgetcsv($f))!==false){
  $programa = $conn->real_escape_string($row[0] ?? '');
  $codigo = $conn->real_escape_string($row[1] ?? '');
  $nombre = $conn->real_escape_string($row[2] ?? '');
  $tipo = $conn->real_escape_string($row[3] ?? '');
  $req = $conn->real_escape_string($row[4] ?? '');
  $stmt = $conn->prepare('INSERT INTO programas (nombre) SELECT ? FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM programas WHERE nombre=?)');
  $stmt->bind_param('ss',$programa,$programa); $stmt->execute(); $stmt->close();
  $res = $conn->query("SELECT id FROM programas WHERE nombre='".$conn->real_escape_string($programa)."' LIMIT 1");
  $pid = ($row2=$res->fetch_assoc())?$row2['id']:null;
  $stmt = $conn->prepare('INSERT IGNORE INTO asignaturas (codigo,nombre) VALUES (?,?)');
  $stmt->bind_param('ss',$codigo,$nombre); $stmt->execute(); $stmt->close();
  if($pid){
    $stmt = $conn->prepare('INSERT IGNORE INTO programa_asignaturas (programa_id,asignatura_id) SELECT ?,id FROM asignaturas WHERE codigo=?');
    $stmt->bind_param('is',$pid,$codigo); $stmt->execute(); $stmt->close();
  }
  if($req){
    $r1 = $conn->query("SELECT id FROM asignaturas WHERE codigo='".$conn->real_escape_string($codigo)."' LIMIT 1")->fetch_assoc();
    $r2 = $conn->query("SELECT id FROM asignaturas WHERE codigo='".$conn->real_escape_string($req)."' LIMIT 1")->fetch_assoc();
    if($r1 && $r2){
      $stmt = $conn->prepare('INSERT IGNORE INTO requisitos_asignatura (asignatura_id,requisito_asignatura_id,tipo) VALUES (?,?,?)');
      $stmt->bind_param('iis',$r1['id'],$r2['id'],$tipo); $stmt->execute(); $stmt->close();
    }
  }
  $inserted++;
}
echo json_encode(['ok'=>true,'inserted'=>$inserted,'msg'=>'Import OK']);
?>