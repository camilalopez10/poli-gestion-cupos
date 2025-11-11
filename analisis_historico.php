<?php
require_once __DIR__ . '/php/conexion.php';

// Consulta para obtener datos por asignatura
$sql = "
  SELECT 
    codigo_asignatura,
    SUM(aprobados) AS aprob,
    SUM(reprobados) AS repro,
    SUM(cancelaciones) AS canc
  FROM matriculas_historicas
  GROUP BY codigo_asignatura
  ORDER BY aprob DESC
";
$res = $conn->query($sql);

// Inicializa arrays
$labels = $aprobados = $reprobados = $cancelaciones = [];

if ($res && $res->num_rows > 0) {
    while ($row = $res->fetch_assoc()) {
        $labels[] = $row['codigo_asignatura'];
        $aprobados[] = (int)$row['aprob'];
        $reprobados[] = (int)$row['repro'];
        $cancelaciones[] = (int)$row['canc'];
    }
}

// Totales globales para la dona
$totales_res = $conn->query("
  SELECT 
    SUM(aprobados) AS aprob, 
    SUM(reprobados) AS repro, 
    SUM(cancelaciones) AS canc
  FROM matriculas_historicas
");
$totales = $totales_res ? $totales_res->fetch_assoc() : ['aprob'=>0,'repro'=>0,'canc'=>0];
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Análisis Histórico</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
body { font-family: Arial, sans-serif; background:#f5f7f6; margin:0; padding:20px; color:#222; }
.container { max-width:1100px; margin:auto; }
h1 { color:#1b6b2f; }
.card { background:#fff; padding:20px; border-radius:10px; box-shadow:0 6px 18px rgba(0,0,0,0.08); margin-top:16px; }
.row { display:flex; flex-wrap:wrap; gap:20px; }
.col { flex:1 1 400px; }
canvas { display:block; width:100% !important; height:320px !important; }
table { width:100%; border-collapse:collapse; margin-top:12px; }
th, td { padding:8px; border:1px solid #eee; text-align:center; }
th { background:#1b6b2f; color:#fff; }
pre { background:#eee; padding:10px; border-radius:5px; overflow-x:auto; }
.no-data { text-align:center; font-weight:bold; color:#dc3545; margin-top:20px; }
</style>
</head>
<body>
<div class="container">
  <h1>📊 Análisis Histórico</h1>
  <p style="color:#555">Visualización de rendimiento académico y tendencias de matrícula.</p>

  <div class="row">
    <div class="col card">
      <h3>Comparativo por asignatura</h3>
      <?php if(count($labels) > 0): ?>
        <canvas id="barChart"></canvas>
      <?php else: ?>
        <div class="no-data">No hay datos para graficar</div>
      <?php endif; ?>
    </div>
    <div class="col card">
      <h3>Distribución general</h3>
      <?php if(array_sum([$totales['aprob'],$totales['repro'],$totales['canc']]) > 0): ?>
        <canvas id="pieChart"></canvas>
      <?php else: ?>
        <div class="no-data">No hay datos para graficar</div>
      <?php endif; ?>
    </div>
  </div>

  <div class="card">
    <h3>📋 Últimos registros</h3>
    <?php
    $q = $conn->query("SELECT codigo_asignatura, anio, periodo, matriculados, aprobados, reprobados, cancelaciones FROM matriculas_historicas ORDER BY anio DESC, periodo DESC LIMIT 20");
    echo '<table><thead><tr><th>Código</th><th>Año</th><th>Período</th><th>Matriculados</th><th>Aprobados</th><th>Reprobados</th><th>Cancelaciones</th></tr></thead><tbody>';
    while ($rw = $q->fetch_assoc()) {
        echo '<tr>
        <td>'.htmlspecialchars($rw['codigo_asignatura']).'</td>
        <td>'.$rw['anio'].'</td>
        <td>'.htmlspecialchars($rw['periodo']).'</td>
        <td>'.$rw['matriculados'].'</td>
        <td>'.$rw['aprobados'].'</td>
        <td>'.$rw['reprobados'].'</td>
        <td>'.$rw['cancelaciones'].'</td>
        </tr>';
    }
    echo '</tbody></table>';
    ?>
  </div>

  <!-- Sección de verificación visual -->
  <div class="card">
    <h3>🔍 Datos para gráficos</h3>
    <pre>
Labels: <?php print_r($labels); ?>
Aprobados: <?php print_r($aprobados); ?>
Reprobados: <?php print_r($reprobados); ?>
Cancelaciones: <?php print_r($cancelaciones); ?>
Totales globales: <?php print_r($totales); ?>
    </pre>
  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    const labels = <?= json_encode($labels) ?>;
    const aprob = <?= json_encode($aprobados) ?>;
    const repro = <?= json_encode($reprobados) ?>;
    const canc = <?= json_encode($cancelaciones) ?>;
    const totales = [<?= (int)$totales['aprob'] ?>, <?= (int)$totales['repro'] ?>, <?= (int)$totales['canc'] ?>];

    if(labels.length > 0){
        new Chart(document.getElementById('barChart'), {
            type:'bar',
            data:{
                labels,
                datasets:[
                    {label:'Aprobados', data:aprob, backgroundColor:'rgba(27,107,47,0.85)'},
                    {label:'Reprobados', data:repro, backgroundColor:'rgba(220,53,69,0.85)'},
                    {label:'Cancelaciones', data:canc, backgroundColor:'rgba(108,117,125,0.7)'}
                ]
            },
            options:{responsive:true, interaction:{mode:'index',intersect:false}, plugins:{legend:{position:'top'}}, scales:{y:{beginAtZero:true}}}
        });
    }

    if(totales.reduce((a,b)=>a+b,0) > 0){
        new Chart(document.getElementById('pieChart'), {
            type:'doughnut',
            data:{
                labels:['Aprobados','Reprobados','Cancelaciones'],
                datasets:[{data:totales, backgroundColor:['#1b6b2f','#dc3545','#6c757d']}]
            },
            options:{plugins:{legend:{position:'right'}}}
        });
    }
});
</script>
</body>
</html>
