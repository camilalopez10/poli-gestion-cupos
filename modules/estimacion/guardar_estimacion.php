<?php
require_once __DIR__ . '/../../php/conexion.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo "Method not allowed"; exit; }
$periodo = $_POST['periodo'] ?? date('Y').'-1';
$codigos = $_POST['codigo'] ?? [];
$cupos_previos = $_POST['cupos_previos'] ?? [];
$t_interna = $_POST['transferencia_interna'] ?? [];
$t_externa = $_POST['transferencia_externa'] ?? [];
if (!count($codigos)) { echo "No hay datos"; exit; }

// Prepare statements
$stmt_check = $conn->prepare("SELECT id FROM estimaciones WHERE codigo_asignatura = ? AND periodo = ?");
$stmt_ins = $conn->prepare("INSERT INTO estimaciones (codigo_asignatura, periodo, transferencia_interna, transferencia_externa, cupos_previos, cupos_estimados) VALUES (?, ?, ?, ?, ?, ?)");
$stmt_upd = $conn->prepare("UPDATE estimaciones SET transferencia_interna = ?, transferencia_externa = ?, cupos_previos = ? WHERE codigo_asignatura = ? AND periodo = ?");

foreach($codigos as $i => $codigo) {
    $codigo = trim($codigo);
    $cp = intval($cupos_previos[$i] ?? 0);
    $ti = floatval($t_interna[$i] ?? 0);
    $te = floatval($t_externa[$i] ?? 0);

    // Check existing
    $stmt_check->bind_param('ss', $codigo, $periodo);
    $stmt_check->execute();
    $res = $stmt_check->get_result();
    if ($res && $res->num_rows > 0) {
        // update
        $stmt_upd->bind_param('ddiss', $ti, $te, $cp, $codigo, $periodo);
        $stmt_upd->execute();
    } else {
        // insert with cupos_estimados = cupos_previos by default
        $cupos_estimados = $cp;
        $stmt_ins->bind_param('ssddii', $codigo, $periodo, $ti, $te, $cp, $cupos_estimados);
        $stmt_ins->execute();
    }
    if ($res) $res->close();
}
$stmt_check->close();
if ($stmt_ins) $stmt_ins->close();
if ($stmt_upd) $stmt_upd->close();

header('Location: index.php?periodo='.urlencode($periodo).'&saved=1');
exit;
?>