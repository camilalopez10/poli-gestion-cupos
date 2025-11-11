<!doctype html>
<html lang="es">
<head><meta charset="utf-8"/><title>Gestión de Asignaturas</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css"/>
<style>
body{font-family:Arial,Helvetica,sans-serif;background:#f4f6f4;color:#222;padding:18px}
.wrap{max-width:1100px;margin:0 auto}
h1{color:#1b6b2f}
table{width:100%;border-collapse:collapse;background:#fff;box-shadow:0 6px 18px rgba(0,0,0,0.04)}
th,td{padding:12px;border-bottom:1px solid #eee;text-align:left}
th{background:#f7f7f7}
.btn{display:inline-block;padding:8px 12px;border-radius:6px;text-decoration:none;color:#fff;background:#1b6b2f}
.muted{background:#777}
form{margin:12px 0;padding:12px;background:#fff;border-radius:6px;box-shadow:0 4px 8px rgba(0,0,0,0.03)}
input,select{padding:8px;width:100%;box-sizing:border-box;margin:6px 0;border:1px solid #dcdcdc;border-radius:4px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.preview{background:#fff;padding:12px;margin-top:12px;border-radius:6px}
</style>
</head>
<body>
<div class="wrap">
  <h1>Gestión de Asignaturas</h1>
  <p>Lista de asignaturas y opción para importar masivamente dentro del mismo módulo.</p>
  <form id="frmAdd">
    <div class="grid">
      <div><label>Código</label><input id="codigo" required/></div>
      <div><label>Nombre</label><input id="nombre" required/></div>
    </div>
    <div style="margin-top:8px">
      <button class="btn" type="submit">Buscar Asignatura</button>
      <button id="btnRefresh" type="button" class="btn muted" style="background:#4b4b4b">Refrescar</button>
    </div>
  </form>

  <div style="margin-top:18px;padding:12px;background:#fff;border-radius:6px">
    <h3>Importar Asignaturas (CSV)</h3>
    <input type="file" id="filecsv" accept=".csv"/>
    <button id="btnPreview" class="btn muted" style="background:#2d7a3a;margin-left:8px">Vista previa</button>
    <button id="btnConfirmImport" class="btn" style="display:none;margin-left:8px">Confirmar importación</button>
    <div id="preview" class="preview" style="display:none"></div>
  </div>

  <table id="tbl" style="margin-top:12px">
    <thead><tr><th>Código</th><th>Nombre</th><th>Acciones</th></tr></thead>
    <tbody></tbody>
  </table>

  <div style="margin-top:18px">
    <h3>Última importación (filas importadas)</h3>
    <ul id="importedList" class="preview"></ul>
  </div>
</div>

<script>
async function fetchAsignaturas(){
  try{
    let res = await fetch('php/asignaturas_api.php?action=list');
    let data = await res.json();
    const tbody = document.querySelector('#tbl tbody');
    tbody.innerHTML = '';
    data.forEach(a=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${a.codigo||''}</td><td>${a.nombre||''}</td><td><button data-id="${a.id}" class="del">Eliminar</button></td>`;
      tbody.appendChild(tr);
    });
  }catch(e){ console.error(e); alert('Error cargando asignaturas.'); }
}

document.getElementById('frmAdd').addEventListener('submit', async (ev)=>{
  ev.preventDefault();
  const codigo=document.getElementById('codigo').value.trim();
  const nombre=document.getElementById('nombre').value.trim();
  if(!codigo||!nombre){ alert('Completa código y nombre'); return; }
  try{
    let res = await fetch('php/asignaturas_api.php?action=create', {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({codigo,nombre})
    });
    let r = await res.json();
    if(r.success){ fetchAsignaturas(); document.getElementById('frmAdd').reset(); } else alert('Error: '+(r.message||JSON.stringify(r)));
  }catch(e){ console.error(e); alert('Error al crear asignatura.'); }
});

document.getElementById('btnRefresh').addEventListener('click', fetchAsignaturas);
document.addEventListener('click', async (ev)=>{
  if(ev.target.classList.contains('del')){
    if(!confirm('Eliminar asignatura?')) return;
    const id = ev.target.dataset.id;
    try{
      let res = await fetch('php/asignaturas_api.php?action=delete&id='+encodeURIComponent(id), {method:'POST'});
      let r = await res.json();
      if(r.success) fetchAsignaturas(); else alert('Error al eliminar');
    }catch(e){ console.error(e); alert('Error al eliminar'); }
  }
});

// Import preview flow
document.getElementById('btnPreview').addEventListener('click', async ()=>{
  const file = document.getElementById('filecsv').files[0];
  if(!file){ alert('Selecciona un archivo CSV'); return; }
  const fd = new FormData(); fd.append('file', file);
  const res = await fetch('php/import_preview_asignaturas.php', {method:'POST', body: fd});
  const data = await res.json();
  if(!data.success){ alert('Error en preview: '+(data.message||'')); return; }
  document.getElementById('preview').style.display='block';
  document.getElementById('preview').innerHTML = '<strong>Columnas:</strong> '+data.header.join(', ') + '<br><strong>Primeras filas:</strong><br>';
  let ul = document.createElement('ul');
  data.rows.slice(0,20).forEach(r=>{ let li=document.createElement('li'); li.textContent = r.join(' | '); ul.appendChild(li); });
  document.getElementById('preview').appendChild(ul);
  document.getElementById('btnConfirmImport').style.display='inline-block';
});

// Confirm import - uploads file to import_confirm endpoint and shows inserted rows
document.getElementById('btnConfirmImport').addEventListener('click', async ()=>{
  const file = document.getElementById('filecsv').files[0];
  if(!file){ alert('Selecciona un archivo CSV'); return; }
  if(!confirm('Confirmar importación?')) return;
  const fd = new FormData(); fd.append('file', file);
  const res = await fetch('php/import_confirm_asignaturas.php',{method:'POST', body: fd});
  const data = await res.json();
  if(!data.success){ alert('Error importando: '+(data.message||'')); return; }
  // show imported elements list
  const ul = document.getElementById('importedList'); ul.innerHTML='';
  data.inserted.forEach(it=>{ let li=document.createElement('li'); li.textContent = it.codigo+' - '+it.nombre; ul.appendChild(li); });
  alert('Importación completada. Filas insertadas: '+data.inserted.length);
  document.getElementById('btnConfirmImport').style.display='none';
  document.getElementById('preview').style.display='none';
  fetchAsignaturas();
});

// initial
fetchAsignaturas();
</script>
</body>
</html>
