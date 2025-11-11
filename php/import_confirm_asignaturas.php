<?php
header('Content-Type: application/json');
require_once __DIR__.'/conexion.php';
if($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_FILES['file'])){ echo json_encode(['success'=>false,'message'=>'Archivo requerido']); exit; }
$tmp = $_FILES['file']['tmp_name'];
$rows = array_map('str_getcsv', file($tmp));
if(count($rows) < 2){ echo json_encode(['success'=>false,'message'=>'Archivo vacío o sin filas']); exit; }
$inserted = [];
$conn->begin_transaction();
try{
    for($i=1;$i<count($rows);$i++){
        $r = $rows[$i];
        $codigo = $conn->real_escape_string(trim($r[0] ?? ''));
        $nombre = $conn->real_escape_string(trim($r[1] ?? ''));
        $creditos = intval($r[2] ?? 0);
        if(!$codigo || !$nombre) continue;
        $qs = $conn->query("SELECT id FROM asignaturas WHERE codigo='".$codigo."' LIMIT 1");
        if($qs && $qs->num_rows>0) continue;
        $stmt = $conn->prepare("INSERT INTO asignaturas (codigo,nombre,creditos) VALUES (?,?,?)");
        $stmt->bind_param('ssi', $codigo, $nombre, $creditos);
        $stmt->execute();
        $inserted[] = ['codigo'=>$codigo,'nombre'=>$nombre,'id'=>$stmt->insert_id];
        $stmt->close();
    }
    $conn->commit();
    echo json_encode(['success'=>true,'inserted'=>$inserted]);
}catch(Exception $e){
    $conn->rollback();
    echo json_encode(['success'=>false,'message'=>$e->getMessage()]);
}
?>