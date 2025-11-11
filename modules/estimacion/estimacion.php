<?php
require_once(__DIR__ . '/../../php/class.work.php');
$work = new WorkDB();
$asignaturas = $work->obtenerAsignaturas();
$msg='';
?>
<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><title>Estimación de Cupos</title>
<link rel="stylesheet" href="estimacion.css">
</head><body>
<div class="card">
<h2>Estimación de Cupos - Cargar variables</h2>
<p class="note">Sube archivos en formato <strong>CSV</strong> (Excel >> Guardar como CSV). Cada archivo debe contener columnas: <code>codigo,tasa</code> o similares; ver README para formato exacto.</p>
<form method="post" action="procesar_estimacion.php" enctype="multipart/form-data">
  <label>Periodo (ej. 2026-1)</label><input name="periodo" required>
  <label>Archivo - Transferencia interna (CSV)</label><input type="file" name="file_interna" accept=".csv" required>
  <label>Archivo - Transferencia externa (CSV)</label><input type="file" name="file_externa" accept=".csv" required>
  <label>Archivo - Cupos previos (CSV: codigo,cupos_previos)</label><input type="file" name="file_previos" accept=".csv" required>
  <div style="margin-top:12px"><button class="btn" type="submit">Procesar estimación</button></div>
</form>
</div>
</body>
</html>
