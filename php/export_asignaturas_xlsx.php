<?php
require_once __DIR__.'/conexion.php';

// Try to use PhpSpreadsheet if vendor/autoload.php exists
if(file_exists(__DIR__.'/vendor/autoload.php')){
    require __DIR__.'/vendor/autoload.php';
    use PhpOffice\PhpSpreadsheet\Spreadsheet;
    use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
    $res = $conn->query("SELECT codigo,nombre,creditos FROM asignaturas ORDER BY nombre");
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setCellValue('A1','Código');
    $sheet->setCellValue('B1','Nombre');
    $sheet->setCellValue('C1','Créditos');
    $row = 2;
    while($r = $res->fetch_assoc()){
        $sheet->setCellValue('A'.$row, $r['codigo']);
        $sheet->setCellValue('B'.$row, $r['nombre']);
        $sheet->setCellValue('C'.$row, $r['creditos']);
        $row++;
    }
    // styling header
    $sheet->getStyle('A1:C1')->getFont()->setBold(true);
    $filename = 'asignaturas_export_'.date('Ymd_His').'.xlsx';
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="'.$filename.'"');
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
} else {
    // fallback CSV
    $res = $conn->query("SELECT codigo,nombre,creditos FROM asignaturas ORDER BY nombre");
    $filename = 'asignaturas_export_'.date('Ymd_His').'.csv';
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="'. $filename .'"');
    $out = fopen('php://output', 'w');
    fputcsv($out, ['Código','Nombre','Créditos']);
    while($r = $res->fetch_assoc()) fputcsv($out, [$r['codigo'],$r['nombre'],$r['creditos']]);
    fclose($out);
    exit;
}
?>