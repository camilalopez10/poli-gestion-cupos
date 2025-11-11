<?php
require_once(__DIR__ . '/../../php/class.work.php');
$work = new WorkDB();
$conn = $work->getConnection();
$id = intval($_GET['id'] ?? 0);
$msg='';
if($id && $_SERVER['REQUEST_METHOD']==='POST'){
    $nombre = $_POST['nombre'] ?? '';
    $rol = $_POST['rol'] ?? 'Coordinador';
    $activo = isset($_POST['activo'])?1:0;
    $stmt = $conn->prepare("UPDATE usuarios SET nombre=?, rol=?, activo=? WHERE id_usuario=?");
    $stmt->bind_param('siii', $nombre, $rol, $activo, $id);
    $stmt->execute();
    $msg='Usuario actualizado';
}
$user = null;
if($id){
    $stmt = $conn->prepare("SELECT id_usuario, nombre, correo, rol, activo FROM usuarios WHERE id_usuario=?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $res = $stmt->get_result();
    $user = $res->fetch_assoc();
    $stmt->close();
}
?>
<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Editar Usuario</title></head><body>
<h2>Editar Usuario</h2>
<?php if($msg) echo '<div>'.$msg.'</div>'; ?>
<?php if($user): ?>
<form method="post">
<label>Nombre</label><input name="nombre" value="<?php echo htmlspecialchars($user['nombre']); ?>"><br>
<label>Rol</label><select name="rol"><option value="Administrador" <?php if($user['rol']=='Administrador') echo 'selected'; ?>>Administrador</option><option value="Coordinador" <?php if($user['rol']=='Coordinador') echo 'selected'; ?>>Coordinador</option><option value="Docente" <?php if($user['rol']=='Docente') echo 'selected'; ?>>Docente</option></select><br>
<label>Activo</label><input type="checkbox" name="activo" <?php if($user['activo']) echo 'checked'; ?>><br>
<button type="submit">Guardar</button>
</form>
<?php else: ?>
<p>Usuario no encontrado.</p>
<?php endif; ?>
</body></html>
