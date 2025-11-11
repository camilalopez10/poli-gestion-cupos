<?php require_once __DIR__.'/../../php/conexion.php'; ?>
<div class="module-inner">
<h2>Analicis historico</h2>
<div style="margin-bottom:8px"><a href="plantillas/plantilla_historico.csv" download>📄 Descargar plantilla historico</a></div>
<input type="file" id="file-asignaturas" accept=".csv">
<button id="btnImportAsig">Importar</button>
<div id="msg-asig"></div>
<script>
document.getElementById('btnImportAsig').addEventListener('click', async ()=>{
  const f = document.getElementById('file-asignaturas').files[0];
  if(!f){ alert('Seleccione CSV'); return; }
  const fd = new FormData(); fd.append('file', f);
  const res = await fetch('php/import_asignaturas.php',{method:'POST', body: fd});
  const j = await res.json();
  document.getElementById('msg-asig').innerText = j.msg || JSON.stringify(j);
});
</script>
</div>