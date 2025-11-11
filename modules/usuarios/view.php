<?php require_once __DIR__.'/../../php/conexion.php'; ?>
<div class="module-inner">
  <h2>Gestión de Usuarios</h2>

  <form id="formUsr" onsubmit="return crearUsuario(event)">
    <input name="nombre" placeholder="Nombre completo" required>
    <input name="correo" id="correo" type="email" placeholder="usuario@elpoli.edu.co" required>
    <input name="password" type="password" placeholder="Contraseña" required>
    <select name="rol" required>
      <option value="">Seleccione rol</option>
      <option value="admin">Administrador</option>
      <option value="academico">Académico</option>
    </select>
    <button type="submit">Crear usuario</button>
  </form>

  <table id="tablaUsr" style="width:100%;margin-top:15px;border-collapse:collapse;">
    <thead>
      <tr style="background:#2E7D32;color:#fff;">
        <th>Nombre</th>
        <th>Correo</th>
        <th>Rol</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody id="bodyUsr" style="background:#fff;"></tbody>
  </table>
</div>

<script>
async function crearUsuario(e) {
  e.preventDefault();

  const form = document.getElementById('formUsr');
  const email = document.getElementById('correo').value.trim().toLowerCase();

  if (!/@elpoli\.edu\.co$/.test(email)) {
    alert('⚠️ Solo se permiten correos institucionales @elpoli.edu.co');
    return false;
  }

  const fd = new FormData(form);
  fd.append('action', 'create');

  try {
    const res = await fetch('php/usuarios_api.php', {
      method: 'POST',
      body: fd
    });
    const data = await res.json();

    if (data.ok) {
      alert('✅ Usuario creado correctamente');
      form.reset();
      loadUsr();
    } else {
      alert('⚠️ ' + (data.error || 'Error al crear usuario'));
    }
  } catch (err) {
    alert('❌ Error de conexión: ' + err);
  }

  return false;
}

async function loadUsr() {
  try {
    const res = await fetch('php/usuarios_api.php?action=list');
    const data = await res.json();

    const tbody = document.getElementById('bodyUsr');
    tbody.innerHTML = '';

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:8px;">No hay usuarios registrados.</td></tr>';
      return;
    }

    data.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(u.nombre)}</td>
        <td>${escapeHtml(u.correo)}</td>
        <td>${escapeHtml(u.rol)}</td>
        <td><a href="#" onclick="delUsr(${u.id})">Eliminar</a></td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error al cargar usuarios:', err);
  }
}

async function delUsr(id) {
  if (!confirm('¿Seguro que deseas eliminar este usuario?')) return;
  const fd = new FormData();
  fd.append('action', 'delete');
  fd.append('id', id);
  const res = await fetch('php/usuarios_api.php', { method: 'POST', body: fd });
  const data = await res.json();
  if (data.ok) loadUsr();
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[c]));
}

// Cargar automáticamente al entrar al módulo
loadUsr();
</script>
