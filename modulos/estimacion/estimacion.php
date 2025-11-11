<?php
require_once '../../class/conexion.php';
require_once '../../class/historial_log.php';
session_start();

$asignatura_id = intval($_GET['asignatura_id'] ?? 0);
$silla_vacia_pct = floatval($_GET['silla_vacia'] ?? 0.05);

if(!$asignatura_id) {
  echo json_encode(['error'=>'asignatura_id requerido']);
  exit;
}

$q = $conn->prepare("SELECT AVG(matriculados) as prom_mat, AVG(tasa_aprobacion) as prom_apr, AVG(tasa_reprobacion) as prom_rep, AVG(tasa_cancelacion) as prom_can FROM indicadores_historicos WHERE asignatura_id = ?");
$q->bind_param("i",$asignatura_id);
$q->execute();
$res = $q->get_result()->fetch_assoc();
$q->close();

$prom_mat = floatval($res['prom_mat'] ?? 0);
$prom_apr = floatval($res['prom_apr'] ?? 0);
$prom_rep = floatval($res['prom_rep'] ?? 0);
$prom_can = floatval($res['prom_can'] ?? 0);

$capacidad_aula = intval($_GET['capacidad'] ?? 40);

$estim_base = $prom_mat * (1 + $prom_rep - $prom_can);
$estim_con_silla = $estim_base * (1 - $silla_vacia_pct);

$cupos_estimados = max(1, round(min($estim_con_silla, $capacidad_aula)));

$userId = $_SESSION['user_id'] ?? null;
$desc = "Estimación generada para asignatura_id={$asignatura_id}: prom_mat={$prom_mat}, prom_rep={$prom_rep}, prom_can={$prom_can}, capacidad={$capacidad_aula}, cupos={$cupos_estimados}";
log_change($conn, $userId, 'estimacion', 'GENERATE', $desc);

echo json_encode([
  'asignatura_id'=>$asignatura_id,
  'prom_mat'=>$prom_mat,
  'prom_rep'=>$prom_rep,
  'prom_can'=>$prom_can,
  'silla_vacia_pct'=>$silla_vacia_pct,
  'capacidad_aula'=>$capacidad_aula,
  'cupos_estimados'=>$cupos_estimados
]);
?>