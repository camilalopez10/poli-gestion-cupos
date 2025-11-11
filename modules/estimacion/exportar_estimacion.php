<?php
require_once(__DIR__ . '/../../php/class.work.php');
$work = new WorkDB();
$conn = $work->getConnection();
$periodo = $_GET['periodo'] ?? '';

if(!$periodo){
    die('Se requiere ?periodo=YYYY-X');
}

$stmt = $conn->prepare("SELECT codigo_asignatura, periodo, transferencia_interna, transferencia_externa, cupos_previos, cupos_estimados, fecha_generacion FROM estimaciones WHERE periodo = ?");
$stmt->bind_param('s', $periodo);
$stmt->execute();
$res = $stmt->get_result();

$outname = "export_estimacion_".preg_replace('/[^0-9A-Za-z_-]/','',$periodo).".csv";
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="'.$outname.'"');
$fh = fopen('php://output','w');
fputcsv($fh, ['codigo_asignatura','periodo','transferencia_interna','transferencia_externa','cupos_previos','cupos_estimados','fecha_generacion']);
while($row = $res->fetch_assoc()){
    fputcsv($fh, [$row['codigo_asignatura'],$row['periodo'],$row['transferencia_interna'],$row['transferencia_externa'],$row['cupos_previos'],$row['cupos_estimados'],$row['fecha_generacion']]);
}
fclose($fh);
exit;
?>
