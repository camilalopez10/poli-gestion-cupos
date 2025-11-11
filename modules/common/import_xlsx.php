<?php
require_once __DIR__.'/../../vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\IOFactory;

function import_xlsx_to_array($inputFilePath){
    $spreadsheet = IOFactory::load($inputFilePath);
    $sheet = $spreadsheet->getActiveSheet();
    $rows = [];
    foreach ($sheet->getRowIterator(2) as $row) {
        $cellIterator = $row->getCellIterator();
        $cellIterator->setIterateOnlyExistingCells(false);
        $r = [];
        foreach ($cellIterator as $cell) {
            $r[] = $cell->getValue();
        }
        $rows[] = $r;
    }
    return $rows;
}
?>