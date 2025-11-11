<?php
require_once '../../class/conexion.php';
require_once '../../class/vendor/autoload.php';
require_once '../../class/historial_log.php';
session_start();

use PhpOffice\PhpSpreadsheet\IOFactory;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $tmp = $_FILES['file']['tmp_name'];
    $ext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
    if(!in_array(strtolower($ext), ['xls','xlsx','csv'])) {
        echo json_encode(['error'=>'Formato no soportado']);
        exit;
    }

    $spreadsheet = IOFactory::load($tmp);
    $sheet = $spreadsheet->getActiveSheet();
    $rows = $sheet->toArray();

    $inserted = 0;
    for ($i=1;$i<count($rows);$i++){
        $r = $rows[$i];
        if (empty($r[0])) continue;
        $asignatura_id = intval($r[0]);
        $periodo = trim($r[1]);
        $matriculados = intval($r[2]);
        $aprobados = intval($r[3]);
        $reprobados = intval($r[4]);
        $cancelados = intval($r[5]);

        $t_aprob = $matriculados>0 ? $aprobados / $matriculados : 0;
        $t_rep = $matriculados>0 ? $reprobados / $matriculados : 0;
        $t_can = $matriculados>0 ? $cancelados / $matriculados : 0;

        $stmt = $conn->prepare("INSERT INTO indicadores_historicos (asignatura_id, periodo, matriculados, aprobados, reprobados, cancelados, tasa_aprobacion, tasa_reprobacion, tasa_cancelacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("isiiiiddd", $asignatura_id, $periodo, $matriculados, $aprobados, $reprobados, $cancelados, $t_aprob, $t_rep, $t_can);
        $stmt->execute();
        $stmt->close();
        $inserted++;
    }

    $userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
    log_change($conn, $userId, 'indicadores_historicos', 'IMPORT', "Importadas $inserted filas desde archivo.");

    echo json_encode(['ok'=>true,'inserted'=>$inserted]);
    exit;
}
echo json_encode(['error'=>'No file']);
?>