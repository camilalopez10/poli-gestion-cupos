<?php
require_once __DIR__ . '/../../php/conexion.php';

// traer asignaturas para la tabla manual:
$periodo = $_GET['periodo'] ?? date('Y').'-1';
$res = $conn->query("SELECT codigo, nombre FROM asignaturas ORDER BY codigo");
$asigs = [];
while($r = $res->fetch_assoc()) $asigs[] = $r;
?>

<div class="modulo-container">

  <h2>Estimación de Cupos</h2>
   <h2> </h2> <h2> </h2>
 <h2> </h2>

  <p class="sub">Calcula los cupos estimados de una asignatura puntual</p>

  <!-- === bloque simple === -->
  <div class="form-grid">
    <label>Asignatura:
      <input id="asig" type="text">
    </label>

    <label>Año:
      <input id="anio" type="number" value="<?php echo date('Y'); ?>">
    </label>

    <label>Periodo:
      <input id="periodo" type="text" value="<?php echo $periodo; ?>">
    </label>

    <label>Capacidad Aula:
      <input id="cap" type="number" value="40">
    </label>

    <button id="calc" class="btn-green">Calcular Estimación</button>
  </div>

  <pre id="out" class="result-box"></pre>

  <hr>

  <!-- === bloque manual === -->
  <h3>Estimación Manual</h3>

  <p class="sub">Ingresa valores manuales y calcula resultado aquí mismo</p>

  <form id="form-manual">
    <input type="hidden" name="periodo" value="<?php echo htmlspecialchars($periodo); ?>">

    <table border="1" cellspacing="0" cellpadding="6">
      <thead>
        <tr>
          <th>Código</th>
          <th>Asignatura</th>
          <th>Cupos previos</th>
       
        </tr>
      </thead>
      <tbody>
      <?php foreach($asigs as $a): ?>
        <tr>
          <td><?php echo $a['codigo']; ?><input type="hidden" name="codigo[]" value="<?php echo $a['codigo']; ?>"></td>
          <td><?php echo $a['nombre']; ?></td>
          <td><input name="cupos_previos[]" type="number" value="0"></td>
          
        </tr>
      <?php endforeach; ?>
      </tbody>
    </table>

    <div style="margin-top:10px;display:flex; gap:10px">
      <button type="button" id="btn-guardar" class="btn-green">Guardar</button>
      <button type="button" id="btn-procesar" class="btn-green">Calcular manual</button>
    </div>
  </form>

  <pre id="outManual" class="result-box"></pre>

</div>

<style>
.modulo-container{max-width:900px;margin:auto}
.form-grid{display:grid;gap:10px;max-width:350px}
.result-box{background:#f9f9f9;padding:10px;border-radius:6px;margin-top:15px;white-space:pre-wrap}
.btn-green{background:#2E7D32;color:#fff;padding:8px 12px;border:none;border-radius:6px;cursor:pointer}
.btn-green:hover{background:#1b4d1c}
.sub{margin-top:-10px;color:#333}
</style>

<script>
// calcular simple:
document.getElementById('calc').addEventListener('click', async ()=>{
  const a=document.getElementById('asig').value;
  const an=document.getElementById('anio').value;
  const p=document.getElementById('periodo').value;
  const c=document.getElementById('cap').value;

  const r=await fetch(`modules/estimacion/procesar_estimacion.php?asig=${a}&anio=${an}&periodo=${p}&cap=${c}`);
  document.getElementById('out').textContent = await r.text();
});

// guardar manual:
document.getElementById('btn-guardar').addEventListener('click', async ()=>{
  const fd = new FormData(document.getElementById('form-manual'));
  const r  = await fetch("modules/estimacion/guardar_estimacion.php",{method:"POST",body:fd});
  alert(await r.text());
});

// calcular manual:
document.getElementById('btn-procesar').addEventListener('click', async ()=>{
  const fd = new FormData(document.getElementById('form-manual'));
  const r  = await fetch("modules/estimacion/procesar_estimacion.php",{method:"POST",body:fd});
  document.getElementById('outManual').textContent = await r.text();
});
</script>
