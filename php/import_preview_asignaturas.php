<?php
header('Content-Type: application/json');
require_once __DIR__.'/conexion.php';
if($_SERVER['REQUEST_METHOD']==='POST' && isset($_FILES['file'])){
    $tmp = $_FILES['file']['tmp_name'];
    $lines = array_map('str_getcsv', file($tmp));
    if(!$lines || count($lines)<1){ echo json_encode(['success'=>false,'message'=>'Archivo inválido']); exit; }
    $header = $lines[0];
    $rows = array_slice($lines,1,50);
    echo json_encode(['success'=>true,'header'=>$header,'rows'=>$rows]);
    exit;
}
echo json_encode(['success'=>false,'message'=>'Método no válido']);
?>