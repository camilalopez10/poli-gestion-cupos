<?php require_once __DIR__.'/../../php/conexion.php'; ?>
<div class="module-inner">
<h2>Gestión de Aulas</h2>
<div style="margin-bottom:8px"><a href="plantillas/plantilla_aulas.csv" download>📄 Descargar plantilla aulas</a></div>
<input type="file" id="file-aulas" accept=".csv">
<button id="btnImportAulas">Importar</button>
<div id="msg-aulas"></div>
<script>
document.getElementById('btnImportAulas').addEventListener('click', async ()=>{
  const f = document.getElementById('file-aulas').files[0];
  if(!f){ alert('Seleccione CSV'); return; }
  const fd = new FormData(); fd.append('file', f);
  const res = await fetch('php/import_aulas.php',{method:'POST', body: fd});
  const j = await res.json();
  document.getElementById('msg-aulas').innerText = j.msg || JSON.stringify(j);
});
</script>
</div>