<?php
// export_xlsx.php - helper to export arrays to XLSX or fallback CSV
// Try to use PhpSpreadsheet if available, otherwise output CSV.
if (file_exists(__DIR__.'/../../vendor/autoload.php')) {
    require_once __DIR__.'/../../vendor/autoload.php';
}
if (class_exists('\\PhpOffice\\PhpSpreadsheet\\Spreadsheet')) {
    use PhpOffice\PhpSpreadsheet\Spreadsheet;
    use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
}

function export_to_xlsx_or_csv($filename, $headers, $rows){
    // if PhpSpreadsheet available -> XLSX
    if (class_exists('\\PhpOffice\\PhpSpreadsheet\\Spreadsheet')) {
        $spreadsheet = new \\PhpOffice\\PhpSpreadsheet\\Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $col = 1;
        foreach($headers as $h){ $sheet->setCellValueByColumnAndRow($col, 1, $h); $col++; }
        $r = 2;
        foreach($rows as $row){
            $c = 1;
            foreach($row as $cell){
                $sheet->setCellValueByColumnAndRow($c, $r, $cell);
                $c++;
            }
            $r++;
        }
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        header('Content-Disposition: attachment; filename="'.$filename.'"');
        $writer = new \\PhpOffice\\PhpSpreadsheet\\Writer\\Xlsx($spreadsheet);
        $writer->save('php://output');
        exit;
    }
    // fallback to CSV
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="'.$filename.'.csv"');
    $out = fopen('php://output', 'w');
    // UTF-8 BOM
    fprintf($out, chr(0xEF).chr(0xBB).chr(0xBF));
    fputcsv($out, $headers);
    foreach($rows as $row){
        fputcsv($out, $row);
    }
    fclose($out);
    exit;
}
?>
