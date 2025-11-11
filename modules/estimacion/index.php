<?php
require_once __DIR__ . '/../../php/conexion.php';
$periodo = $_GET['periodo'] ?? date('Y').'-1';
$res = $conn->query("SELECT codigo, nombre FROM asignaturas ORDER BY codigo");
$asigs = [];
while($r = $res->fetch_assoc()) $asigs[] = $r;
?>
<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Estimación - Manual</title>
<link rel="stylesheet" href="estimacion.css">
</head><body style="font-family:Arial,Helvetica,sans-serif">
<div class="card">
  <h2>Estimación de Cupos (Ingreso manual)</h2>
  <p class="note">Ingrese valores manualmente para cada asignatura. Pulse <strong>Guardar</strong> para almacenar, y <strong>Calcular</strong> para procesar y descargar el CSV.</p>

  <form id="form-guardar" method="post" action="guardar_estimacion.php">
    <input type="hidden" name="periodo" value="<?php echo htmlspecialchars($periodo); ?>">
    <table class="table" cellpadding="6" cellspacing="0">
      <thead><tr><th>Código</th><th>Asignatura</th><th>Cupos previos</th><th>Transf. interna (%)</th><th>Transf. externa (%)</th></tr></thead>
      <tbody>
      <?php foreach($asigs as $a): ?>
        <tr>
          <td><?php echo htmlspecialchars($a['codigo']); ?><input type="hidden" name="codigo[]" value="<?php echo htmlspecialchars($a['codigo']); ?>"></td>
          <td><?php echo htmlspecialchars($a['nombre']); ?></td>
          <td><input name="cupos_previos[]" type="number" min="0" value="0" required></td>
          <td><input name="transferencia_interna[]" type="number" step="0.01" value="0" required></td>
          <td><input name="transferencia_externa[]" type="number" step="0.01" value="0" required></td>
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>
    <div style="margin-top:12px;">
      <button type="submit" class="btn">Guardar</button>
      <button type="button" id="btn-calcular" class="btn">Calcular</button>
    </div>
  </form>
</div>

<script>
document.getElementById('btn-calcular').addEventListener('click', function(){
  const periodo = encodeURIComponent("<?php echo htmlspecialchars($periodo); ?>");
  window.location.href = 'calcular_estimacion.php?periodo=' + periodo;
});
</script>
</body></html>