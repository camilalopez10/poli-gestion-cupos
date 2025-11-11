<?php require_once __DIR__.'/../../php/conexion.php'; ?>
<div class="module-inner">
<h2>Malla Curricular (Pensum)</h2>

<!-- Botón agregar -->
<button id="btnNuevo" style="background:#2E7D32;color:white;padding:6px 12px;border:none;border-radius:5px;cursor:pointer;">+ Nuevo</button>

<!-- Tabla -->
<table id="tablaPensum" border="1" cellpadding="6" cellspacing="0" width="100%" style="margin-top:10px;border-collapse:collapse;">
<thead style="background:#2E7D32;color:white;">
  <tr>
    <th>ID</th>
    <th>Programa</th>
    <th>Código Asignatura</th>
    <th>Nombre Asignatura</th>
    <th>Créditos</th>
    <th>Acciones</th>
  </tr>
</thead>
<tbody></tbody>
</table>

<!-- Modal -->
<div id="modal" style="display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);justify-content:center;align-items:center;">
  <div style="background:white;padding:20px;border-radius:10px;width:400px;">
    <h3 id="modal-title">Nuevo registro</h3>
    <label>Programa:</label>
    <input type="text" id="programa" style="width:100%;padding:5px;"><br>
    <label>Código Asignatura:</label>
    <input type="text" id="codigo" style="width:100%;padding:5px;"><br>
    <label>Nombre Asignatura:</label>
    <input type="text" id="nombre" style="width:100%;padding:5px;"><br>
    <label>Créditos:</label>
    <input type="number" id="creditos" style="width:100%;padding:5px;"><br>
    <div style="text-align:right;margin-top:10px;">
      <button id="btnGuardar" style="background:#2E7D32;color:white;padding:5px 10px;border:none;border-radius:4px;">Guardar</button>
      <button onclick="cerrarModal()">Cancelar</button>
    </div>
  </div>
</div>

<script>
async function cargarPensum(){
  const res = await fetch('php/pensum_crud.php?action=list');
  const data = await res.json();
  const tbody = document.querySelector('#tablaPensum tbody');
  tbody.innerHTML = '';
  data.forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.id}</td>
      <td>${r.programa}</td>
      <td>${r.codigo}</td>
      <td>${r.nombre}</td>
      <td>${r.creditos}</td>
      <td>
        <button onclick="editar(${r.id})">✏️</button>
        <button onclick="eliminar(${r.id})">🗑️</button>
      </td>`;
    tbody.appendChild(tr);
  });
}

document.getElementById('btnNuevo').addEventListener('click',()=>{
  abrirModal();
});

async function eliminar(id){
  if(!confirm('¿Eliminar registro?')) return;
  const res = await fetch('php/pensum_crud.php?action=delete&id='+id);
  const j = await res.json();
  alert(j.msg);
  cargarPensum();
}

function abrirModal(data=null){
  document.getElementById('modal').style.display='flex';
  document.getElementById('programa').value = data?.programa || '';
  document.getElementById('codigo').value = data?.codigo || '';
  document.getElementById('nombre').value = data?.nombre || '';
  document.getElementById('creditos').value = data?.creditos || '';
  document.getElementById('btnGuardar').setAttribute('data-id', data?.id || '');
}
function cerrarModal(){ document.getElementById('modal').style.display='none'; }

async function editar(id){
  const res = await fetch('php/pensum_crud.php?action=get&id='+id);
  const data = await res.json();
  abrirModal(data);
}

document.getElementById('btnGuardar').addEventListener('click', async ()=>{
  const fd = new FormData();
  fd.append('programa', document.getElementById('programa').value);
  fd.append('codigo', document.getElementById('codigo').value);
  fd.append('nombre', document.getElementById('nombre').value);
  fd.append('creditos', document.getElementById('creditos').value);
  const id = document.getElementById('btnGuardar').getAttribute('data-id');
  let url = 'php/pensum_crud.php?action=' + (id ? 'update&id='+id : 'add');
  const res = await fetch(url, { method:'POST', body: fd });
  const j = await res.json();
  alert(j.msg);
  cerrarModal();
  cargarPensum();
});

cargarPensum();
</script>
</div>
