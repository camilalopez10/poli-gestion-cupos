<?php
session_start();
if (!isset($_SESSION['user'])) {
    header("Location: index.html");
    exit();
}
include 'php/conexion.php';
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Politécnico JIC - Gestión de Cupos</title>
<link rel="stylesheet" href="assets/css/style_cards.css">

<style>
body { display:flex; margin:0; font-family:Arial,sans-serif; }
#menu-lateral{ width:220px; background:#2E7D32; color:white; min-height:100vh; padding:20px 10px; }
#menu-lateral img{ width:100px; display:block; margin:0 auto 20px; }
#menu-lateral ul{ list-style:none; padding:0; }
#menu-lateral li{ margin:10px 0; }
#menu-lateral a{ color:#fff; text-decoration:none; display:block; padding:8px 10px; border-radius:6px; transition:background .3s; cursor:pointer; }
#menu-lateral a:hover,
#menu-lateral li.active a{ background:#1B5E20; }

main{ flex:1; background:#f7f7f7; padding:20px; }
#header{ display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }

#session-controls{ display:flex; align-items:center; gap:10px; }
#logout-btn{ background:#1B5E20; border:none; color:white; padding:8px 12px; border-radius:6px; cursor:pointer; transition:background .3s; }
#logout-btn:hover{ background:#144419; }

#dashboard-cards,#contenido{ transition:opacity .3s ease; }
.hidden{ opacity:0; pointer-events:none; display:none; }
</style>
</head>
<body>

<aside id="menu-lateral">
    <img src="img/logo-poli.jpg" alt="Logo Poli">
    <ul>
        <li class="active"><a data-module="inicio">Inicio</a></li>
        <li><a data-module="usuarios">Gestión de Usuarios</a></li>
        <li><a data-module="asignaturas">Gestión de Asignaturas</a></li>
        <li><a data-module="aulas">Gestión de Aulas</a></li>
        <li><a data-module="estimacion">Estimación de Cupos</a></li>
        <li><a data-module="historico">Análisis Histórico</a></li>
        <li><a data-module="pensum">Malla Curricular</a></li>
        <li><a data-module="historial">Historial de Cambios</a></li>
        <li><a data-module="acerca">Acerca de</a></li>
        <li><a href="#" id="btn-atras">Atrás</a></li>
    </ul>
</aside>

<main id="main-content">

    <div id="header">
        <h1 id="welcome-msg">
            Bienvenido: <?php echo htmlspecialchars($_SESSION['user']['nombre']); ?> 
            (<?php echo htmlspecialchars($_SESSION['user']['rol']); ?>)
        </h1>
        <div id="session-controls">
            <button id="logout-btn">Cerrar sesión</button>
        </div>
    </div>

    <div id="dashboard-cards">
        <?php include 'partials/dashboard_cards.html'; ?>
    </div>

    <div id="contenido" style="display:none;padding:18px;"></div>

</main>

<script>
async function cargarModulo(name) {
    const cards = document.getElementById('dashboard-cards');
    const contenido = document.getElementById('contenido');

    if (name === 'inicio') {
        cards.classList.remove('hidden');
        contenido.style.display = 'none';
        contenido.innerHTML = '';
        return;
    }

    cards.classList.add('hidden');
    contenido.style.display = 'block';
    contenido.innerHTML = '<p>Cargando módulo...</p>';

    let ruta = '';
    switch (name) {
        case 'asignaturas': ruta = 'asignaturas_ui.php'; break;
        case 'usuarios': ruta = 'modules/usuarios/view.php'; break;
        case 'aulas': ruta = 'modules/aulas/view.php'; break;
        case 'estimacion': ruta = 'modules/estimacion/view.php'; break;
        case 'historico': ruta = 'analisis_historico.php'; break;
        case 'pensum': ruta = 'modules/pensum/view.php'; break;
        case 'historial': ruta = 'modules/historial_cambios/index.php'; break; /* ✅ Ruta corregida */
        case 'acerca': ruta = 'acerca.php'; break;
        default: ruta = ''; break;
    }

    if (ruta) {
        try {
            const res = await fetch(ruta);
            const html = await res.text();
            contenido.innerHTML = html;
        } catch (error) {
            contenido.innerHTML = '<p style="color:red;">Error al cargar el módulo.</p>';
        }
    } else {
        contenido.innerHTML = '<p>Módulo no encontrado.</p>';
    }
}

document.querySelectorAll('[data-module]').forEach(el => {
    el.addEventListener('click', () => cargarModulo(el.getAttribute('data-module')));
});

document.getElementById('btn-atras').addEventListener('click', () => cargarModulo('inicio'));

document.getElementById('logout-btn').addEventListener('click', async () => {
    await fetch('php/logout.php');
    window.location.href = 'index.html';
});

window.addEventListener('DOMContentLoaded', () => cargarModulo('inicio'));
</script>

<script>
document.querySelectorAll('.go-module').forEach(btn => {
    btn.addEventListener('click', () => {
        const modulo = btn.getAttribute('data-target');
        cargarModulo(modulo);
    });
});
</script>

</body>
</html>
