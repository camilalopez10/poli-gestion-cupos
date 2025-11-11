<?php
require_once __DIR__ . '/../../php/conexion.php';
$periodo = $_GET['periodo'] ?? date('Y').'-1';
$stmt = $conn->prepare("SELECT id, codigo_asignatura, periodo, transferencia_interna, transferencia_externa, cupos_previos FROM estimaciones WHERE periodo = ?");
if (!$stmt) { echo 'Prepare failed: '.$conn->error; exit; }
$stmt->bind_param('s', $periodo);
$stmt->execute();
$res = $stmt->get_result();
$rows = [];
while($r = $res->fetch_assoc()){
    $cp = intval($r['cupos_previos']);
    $ti = floatval($r['transferencia_interna']);
    $te = floatval($r['transferencia_externa']);
    $add_interna = $cp > 0 ? round($cp * ($ti/100)) : 0;
    $add_externa = $cp > 0 ? round($cp * ($te/100)) : 0;
    $estimado = max(0, $cp + $add_interna + $add_externa);

    // Update DB
    $upd = $conn->prepare("UPDATE estimaciones SET cupos_estimados = ? WHERE id = ?");
    if ($upd) {
        $upd->bind_param('ii', $estimado, $r['id']);
        $upd->execute();
        $upd->close();
    }

    $rows[] = [
        'codigo' => $r['codigo_asignatura'],
        'periodo' => $r['periodo'],
        'transferencia_interna' => $ti,
        'transferencia_externa' => $te,
        'cupos_previos' => $cp,
        'cupos_estimados' => $estimado
    ];
}
$stmt->close();

$outname = "proyeccion_cupos_".date('Ymd_His').".csv";
header('Content-Type: text/csv; charset=utf-8');
header('Content-Disposition: attachment; filename="'.$outname.'"');
$fh = fopen('php://output','w');
// headers
fputcsv($fh, ['codigo_asignatura','periodo','transferencia_interna','transferencia_externa','cupos_previos','cupos_estimados']);
foreach($rows as $r){
    fputcsv($fh, [$r['codigo'],$r['periodo'],$r['transferencia_interna'],$r['transferencia_externa'],$r['cupos_previos'],$r['cupos_estimados']]);
}
fclose($fh);
exit;
?>