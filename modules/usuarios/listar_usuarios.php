<?php
require_once(__DIR__ . '/../../php/class.work.php');
$work = new WorkDB();
$conn = $work->getConnection();
$res = $conn->query("SELECT id_usuario, nombre, correo, rol, activo FROM usuarios ORDER BY nombre");
?>
<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Usuarios</title>
<style>body{font-family:Arial;padding:20px;background:#f4f6f7}table{border-collapse:collapse;width:100%;background:#fff}th,td{padding:8px;border:1px solid #e6e6e6}th{background:#2E7D32;color:#fff}</style>
</head><body>
<h2>Usuarios</h2>
<table><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Activo</th></tr>
<?php if($res){ while($r=$res->fetch_assoc()){ echo '<tr><td>'.htmlspecialchars($r['nombre']).'</td><td>'.htmlspecialchars($r['correo']).'</td><td>'.htmlspecialchars($r['rol']).'</td><td>'.($r['activo']? 'Sí':'No').'</td></tr>'; } } ?>
</table>
</body></html>
