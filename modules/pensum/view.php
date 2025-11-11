<?php require_once __DIR__.'/../../php/conexion.php'; ?>
<div class="module-inner">
  <h2 style="color:#2E7D32;">Malla Curricular</h2>

  <div style="margin-bottom:12px;">
    <a href="plantillas/plantilla_pensum.xlsx" download style="color:#2E7D32; text-decoration:none;">
       Descargar plantilla de PENSUM (.xlsx)
    </a>
  </div>

  <input type="file" id="file-pensum" accept=".xlsx" style="margin-bottom:8px; padding:5px;">
  <button id="btnImportPensum" style="background:#2E7D32; color:white; border:none; padding:8px 16px; border-radius:5px; cursor:pointer;">
    Importar
  </button>

  <div id="msg-pensum" style="margin-top:15px; font-size:14px; color:#333;"></div>

  <script>
  document.getElementById('btnImportPensum').addEventListener('click', async () => {
    const fileInput = document.getElementById('file-pensum');
    const file = fileInput.files[0];
    const msg = document.getElementById('msg-pensum');

    if (!file) {
      alert('Por favor, seleccione un archivo .xlsx');
      return;
    }

    if (!file.name.endsWith('.xlsx')) {
      alert('Solo se permiten archivos en formato Excel (.xlsx)');
      return;
    }

    const fd = new FormData();
    fd.append('archivo_excel', file);

    msg.innerHTML = '⏳ Procesando archivo...';

    try {
      const res = await fetch('php/importar_pensum.php', { method: 'POST', body: fd });
      const data = await res.json();

      if (data.error) {
        msg.innerHTML = `<span style="color:red;">❌ ${data.error}</span>`;
      } else {
        msg.innerHTML = `
          <div style="background:#E8F5E9; padding:10px; border-radius:5px;">
             <b>${data.mensaje}</b><br>
            Relaciones insertadas: <b>${data.relaciones_insertadas}</b><br>
            Programas creados: <b>${data.programas_creados}</b><br>
            Asignaturas creadas: <b>${data.asignaturas_creadas}</b><br>
            Omitidos: <b>${data.omitidos}</b>
          </div>`;
      }
    } catch (err) {
      msg.innerHTML = `<span style="color:red;">⚠️ Error al enviar archivo: ${err.message}</span>`;
    }
  });
  </script>
</div>
