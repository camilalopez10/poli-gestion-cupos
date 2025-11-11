<?php
require_once __DIR__.'/conexion.php';
require_once __DIR__.'/historial_log.php';
header('Content-Type: application/json; charset=utf-8');
$asig = intval($_GET['asignatura_id'] ?? 0);
$cap = intval($_GET['capacidad'] ?? 40);
$silla = floatval($_GET['silla'] ?? 0.05);
if(!$asig){ echo json_encode(['error'=>'asignatura_id required']); exit; }
$q = $conn->prepare('SELECT AVG(matriculados) as prom_mat, AVG(tasa_reprobacion) as prom_rep, AVG(tasa_cancelacion) as prom_can FROM indicadores_historicos WHERE asignatura_id=?');
$q->bind_param('i',$asig); $q->execute(); $res=$q->get_result()->fetch_assoc(); $q->close();
$prom_mat = floatval($res['prom_mat'] ?? 0); $prom_rep = floatval($res['prom_rep'] ?? 0); $prom_can = floatval($res['prom_can'] ?? 0);
// Fine-tuned formula (from TDG): base = prom_mat + (prom_mat * prom_rep) - (prom_mat * prom_can)
// then apply silla vacia and cap
$estim_base = $prom_mat + ($prom_mat * $prom_rep) - ($prom_mat * $prom_can);
$estim_con = $estim_base * (1 - $silla);
$cupos = max(1, round(min($estim_con, $cap)));
// Save to cupos_estimados
$stmt = $conn->prepare('INSERT INTO cupos_estimados (asignatura, anio, periodo, cupos_calculados) VALUES (?,?,?,?)');
$stmt->bind_param('sisi', $asig, $anio = intval($_GET['anio'] ?? date('Y')), $periodo = $_GET['periodo'] ?? '', $cupos);
$stmt->execute(); $stmt->close();
log_change($conn,null,'estimacion','GENERATE',"Estimacion asig={$asig} cupos={$cupos}");
echo json_encode(['cupos'=>$cupos,'prom_mat'=>$prom_mat,'prom_rep'=>$prom_rep,'prom_can'=>$prom_can]); ?>