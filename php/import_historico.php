<?php
require_once __DIR__.'/conexion.php';
require_once __DIR__.'/historial_log.php';
require_once __DIR__.'/SimpleXLSX.php';
header('Content-Type: application/json; charset=utf-8');
if($_SERVER['REQUEST_METHOD']!=='POST'){ echo json_encode(['error'=>'POST required']); exit; }
$inserted=0;
if(isset($_FILES['file'])){
    $name = $_FILES['file']['name'];
    $tmp = $_FILES['file']['tmp_name'];
    $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
    if($ext==='csv'){
        $f = fopen($tmp,'r'); $row=0;
        while(($data = fgetcsv($f,10000,','))!==FALSE){
            if($row==0){ $row++; continue; }
            $asig = intval($data[0]); $periodo = $conn->real_escape_string($data[1]); $mat = intval($data[2]); $apr = intval($data[3]); $rep = intval($data[4]); $can = intval($data[5]);
            $t_apr = $mat>0 ? $apr/$mat : 0; $t_rep = $mat>0 ? $rep/$mat : 0; $t_can = $mat>0 ? $can/$mat : 0;
            $stmt = $conn->prepare('INSERT INTO indicadores_historicos (asignatura_id,periodo,matriculados,aprobados,reprobados,cancelados,tasa_aprobacion,tasa_reprobacion,tasa_cancelacion) VALUES (?,?,?,?,?,?,?,?,?)');
            $stmt->bind_param('isiiiiidd', $asig,$periodo,$mat,$apr,$rep,$can,$t_apr,$t_rep,$t_can); $stmt->execute(); $stmt->close(); $inserted++;
        }
        fclose($f);
    } elseif($ext==='xlsx'){
        $xlsx = SimpleXLSX::parse($tmp);
        if($xlsx){
            foreach($xlsx->rows() as $i=>$row){
                if($i==0) continue;
                $asig = intval($row[0]); $periodo = $conn->real_escape_string($row[1] ?? ''); $mat = intval($row[2] ?? 0); $apr = intval($row[3] ?? 0); $rep = intval($row[4] ?? 0); $can = intval($row[5] ?? 0);
                $t_apr = $mat>0 ? $apr/$mat : 0; $t_rep = $mat>0 ? $rep/$mat : 0; $t_can = $mat>0 ? $can/$mat : 0;
                $stmt = $conn->prepare('INSERT INTO indicadores_historicos (asignatura_id,periodo,matriculados,aprobados,reprobados,cancelados,tasa_aprobacion,tasa_reprobacion,tasa_cancelacion) VALUES (?,?,?,?,?,?,?,?,?)');
                $stmt->bind_param('isiiiiidd', $asig,$periodo,$mat,$apr,$rep,$can,$t_apr,$t_rep,$t_can); $stmt->execute(); $stmt->close(); $inserted++;
            }
        }
    } else { echo json_encode(['error'=>'unsupported extension']); exit; }
    log_change($conn,null,'import','IMPORT CSV/XLSX','Inserted '.$inserted.' rows');
    echo json_encode(['ok'=>true,'inserted'=>$inserted]);
    exit;
}
echo json_encode(['error'=>'file required']);
?>