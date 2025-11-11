<?php
require_once(__DIR__ . '/../../php/class.work.php');
$work = new WorkDB();

function parse_csv_to_map($path, $col_key=0, $col_val=1){
    $map = [];
    if(!file_exists($path)) return $map;
    if (($handle = fopen($path, "r")) !== FALSE) {
        while (($data = fgetcsv($handle, 10000, ",")) !== FALSE) {
            if (count($data) <= max($col_key, $col_val)) continue;
            $key = trim($data[$col_key]);
            $val = floatval(str_replace('%','',trim($data[$col_val])));
            $map[$key] = $val;
        }
        fclose($handle);
    }
    return $map;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $periodo = $_POST['periodo'] ?? date('Y-m-d');
    $interna_path = $_FILES['file_interna']['tmp_name'] ?? '';
    $externa_path = $_FILES['file_externa']['tmp_name'] ?? '';
    $previos_path  = $_FILES['file_previos']['tmp_name'] ?? '';

    if(!$interna_path || !$externa_path || !$previos_path){
        die('Faltan archivos');
    }

    $map_interna = parse_csv_to_map($interna_path, 0, 1);
    $map_externa = parse_csv_to_map($externa_path, 0, 1);
    $map_previos = parse_csv_to_map($previos_path, 0, 1);

    $asigs = $work->obtenerAsignaturas();
    $resultados = [];
    foreach($asigs as $a){
        $codigo = $a['codigo'];
        $cupos_prev = intval($map_previos[$codigo] ?? 0);
        $t_interna = floatval($map_interna[$codigo] ?? 0);
        $t_externa = floatval($map_externa[$codigo] ?? 0);

        if($cupos_prev > 0){
            $add_interna = round($cupos_prev * ($t_interna/100));
            $add_externa = round($cupos_prev * ($t_externa/100));
        } else {
            $add_interna = 0;
            $add_externa = 0;
        }
        $cupos_estimados = max(0, $cupos_prev + $add_interna + $add_externa);

        $fila = [
            'codigo_asignatura' => $codigo,
            'periodo' => $periodo,
            'tasa_aprobacion' => 0.00,
            'tasa_reprobacion' => 0.00,
            'transferencia_interna' => $t_interna,
            'transferencia_externa' => $t_externa,
            'cupos_previos' => $cupos_prev,
            'cupos_estimados' => $cupos_estimados
        ];
        $resultados[] = $fila;
    }

    $save = $work->guardarResultadosBatch($resultados);

    $outname = "proyeccion_cupos_".date('Ymd_His').".csv";
    $outpath = sys_get_temp_dir().DIRECTORY_SEPARATOR.$outname;
    $fh = fopen($outpath, 'w');
    fputcsv($fh, ['codigo_asignatura','periodo','transferencia_interna','transferencia_externa','cupos_previos','cupos_estimados']);
    foreach($resultados as $r){
        fputcsv($fh, [$r['codigo_asignatura'],$r['periodo'],$r['transferencia_interna'],$r['transferencia_externa'],$r['cupos_previos'],$r['cupos_estimados']]);
    }
    fclose($fh);

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="'.$outname.'"');
    readfile($outpath);
    @unlink($outpath);
    exit;
}
?>
