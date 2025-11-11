<?php
require_once __DIR__ . '/../../php/conexion.php';
header('Content-Type: application/json');

// Si se sube un archivo CSV (importación masiva)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $file = $_FILES['file']['tmp_name'];

    if (!file_exists($file)) {
        echo json_encode(['error' => 'Archivo no encontrado']);
        exit;
    }

    $handle = fopen($file, 'r');
    $count = 0;
    $errores = 0;

    // saltar encabezado si existe
    fgetcsv($handle, 1000, ',');

    while (($row = fgetcsv($handle, 1000, ',')) !== false) {
        [$asig, $anio, $periodo, $cap] = $row;

        $anio = intval($anio);
        $cap = intval($cap);

        if (!$asig || !$anio || !$periodo || !$cap) {
            $errores++;
            continue;
        }

        procesarEstimacion($conn, $asig, $anio, $periodo, $cap, $count, $errores);
    }
    fclose($handle);

    echo json_encode(['ok' => true, 'msg' => "Procesadas: $count filas, Errores: $errores"]);
    exit;
}

// Si es un cálculo individual (GET)
$asig   = $_GET['asig']    ?? '';
$anio   = intval($_GET['anio'] ?? 0);
$period = $_GET['periodo'] ?? '';
$cap    = intval($_GET['cap'] ?? 0);

if ($asig === '' || $anio === 0 || $period === '' || $cap === 0) {
    echo json_encode(["error" => "Faltan parámetros"]);
    exit;
}

// Procesar un solo registro
procesarEstimacion($conn, $asig, $anio, $period, $cap);

function procesarEstimacion($conn, $asig, $anio, $period, $cap, &$count = null, &$errores = null) {
    // Buscar datos históricos
    $q = $conn->prepare("SELECT matriculados, aprobados, cancelaciones, deserciones
                         FROM historico
                         WHERE asignatura = ? AND anio = ? AND periodo = ?
                         LIMIT 1");
    $q->bind_param("sis", $asig, $anio, $period);
    $q->execute();
    $res = $q->get_result();
    $h = $res->fetch_assoc();

    if (!$h) {
        if ($errores !== null) $errores++;
        if ($count === null) echo json_encode(["error" => "No se encontraron datos históricos para esa asignatura."]);
        return;
    }

    $matriculados = $h['matriculados'];
    $aprobados = $h['aprobados'];
    $cancelaciones = $h['cancelaciones'];
    $deserciones = $h['deserciones'];

    if ($matriculados <= 0) $matriculados = 1;

    // Tasas
    $tA = $aprobados / $matriculados;
    $tC = $cancelaciones / $matriculados;
    $tD = $deserciones / $matriculados;

    // Cálculo
    $cupos = intval(($matriculados * (1 + $tA)) - ($matriculados * ($tC + $tD)));
    if ($cupos > $cap) $cupos = $cap;

    // Guardar estimación
    $stmt = $conn->prepare("INSERT INTO cupos_estimados(asignatura, anio, periodo, cupos_calculados)
                            VALUES (?,?,?,?)");
    $stmt->bind_param("sisi", $asig, $anio, $period, $cupos);
    $stmt->execute();

    if ($count !== null) $count++;

    if ($count === null) {
        echo json_encode([
            "ok" => true,
            "asignatura" => $asig,
            "anio" => $anio,
            "periodo" => $period,
            "matriculados_previos" => $matriculados,
            "cupos_calculados" => $cupos
        ]);
    }
}
