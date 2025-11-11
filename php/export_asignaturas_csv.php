<?php
require_once __DIR__.'/conexion.php';
$res = $conn->query('SELECT codigo,nombre,creditos FROM asignaturas ORDER BY id');
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="asignaturas_export.csv"');
$out = fopen('php://output','w'); fputcsv($out, ['codigo','nombre','creditos']);
while($r=$res->fetch_assoc()) fputcsv($out, [$r['codigo'],$r['nombre'],$r['creditos']]);
fclose($out);
?>