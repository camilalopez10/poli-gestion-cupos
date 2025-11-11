<?php
// auditoria helper (auto-inserted)
if(!function_exists('registrar_accion')){
    $____aud_paths = [__DIR__ . '/../../class/funciones_auditoria.php', __DIR__ . '/../class/funciones_auditoria.php', __DIR__ . '/../../../class/funciones_auditoria.php', __DIR__ . '/../funciones_auditoria.php', __DIR__ . '/../../class/funciones_auditoria.php'];
    foreach($__aud_paths as $p){ if(file_exists($p)){ require_once $p; break; } }
}

// export_xlsx.php - recibe mismos filtros que index.php
session_start();
require_once __DIR__ . '/../../class/conexion.php';
require_once __DIR__ . '/../../class/funciones_auditoria.php';
if (!isset($_SESSION['user_id']) || !isset($_SESSION['rol']) || $_SESSION['rol'] !== 'admin') { http_response_code(403); echo 'Acceso denegado'; exit; }

$usuario = isset($_GET['usuario']) ? trim($_GET['usuario']) : '';
$modulo = isset($_GET['modulo']) ? trim($_GET['modulo']) : '';
$accion = isset($_GET['accion']) ? trim($_GET['accion']) : '';
$fecha_desde = isset($_GET['fecha_desde']) && $_GET['fecha_desde'] !== '' ? $_GET['fecha_desde'] . ' 00:00:00' : null;
$fecha_hasta = isset($_GET['fecha_hasta']) && $_GET['fecha_hasta'] !== '' ? $_GET['fecha_hasta'] . ' 23:59:59' : null;

$where = ' WHERE 1=1 '; $params=[]; $types='';
if ($usuario !== '') { $where .= ' AND (u.nombre LIKE ? OR u.correo LIKE ?) '; $like = "%{$usuario}%"; $params[]=$like; $params[]=$like; $types.='ss'; }
if ($modulo !== '') { $where .= ' AND h.modulo = ? '; $params[]=$modulo; $types.='s'; }
if ($accion !== '') { $where .= ' AND h.accion = ? '; $params[]=$accion; $types.='s'; }
if ($fecha_desde) { $where .= ' AND h.fecha >= ? '; $params[]=$fecha_desde; $types.='s'; }
if ($fecha_hasta) { $where .= ' AND h.fecha <= ? '; $params[]=$fecha_hasta; $types.='s'; }

$sql = "SELECT h.id, u.nombre AS usuario_nombre, h.modulo, h.accion, h.descripcion, h.fecha FROM historial_cambios h LEFT JOIN usuarios u ON u.id = h.usuario_id " . $where . " ORDER BY h.fecha DESC";
$stmt = $conn->prepare($sql);
if ($stmt===false) { die('Error: '.$conn->error); }
if (!empty($params)) $stmt->bind_param($types, ...$params);
$stmt->execute(); $result = $stmt->get_result();
    // registro de auditoría automático insertado
    $__user_id = isset($_SESSION['user']['id']) ? $_SESSION['user']['id'] : null;
    if (isset($conn) && $__user_id !== null) {
        registrar_accion($conn, $__user_id, 'Historial_cambios', 'Exportación', 'SELECT h.id, u.nombre AS usuario_nombre, h.modulo, h.accion, h.descripcion, h.fecha FROM historial_cambios h LEFT JOIN usuarios u ON u.id = h.usuario_id ');
    }

if (file_exists(__DIR__ . '/../../vendor/autoload.php')) {
    require_once __DIR__ . '/../../vendor/autoload.php';
    use PhpOffice\PhpSpreadsheet\Spreadsheet;
    use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->fromArray(['ID','Usuario','Módulo','Acción','Descripción','Fecha'], NULL, 'A1');
    $rowNum = 2;
    while($r = $result->fetch_assoc()) {
        $sheet->fromArray([$r['id'],$r['usuario_nombre'],$r['modulo'],$r['accion'],$r['descripcion'],$r['fecha']], NULL, 'A' . $rowNum);
        $rowNum++;
    }
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="historial_cambios.xlsx"');
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
} else {
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename=historial_cambios.csv');
    $out = fopen('php://output', 'w');
    fputcsv($out, ['ID','Usuario','Módulo','Acción','Descripción','Fecha']);
    while($r = $result->fetch_assoc()) {
        fputcsv($out, [$r['id'],$r['usuario_nombre'],$r['modulo'],$r['accion'],$r['descripcion'],$r['fecha']]);
    }
    fclose($out);
    exit;
}
?>