<?php
require_once __DIR__.'/conexion.php';
header('Content-Type: application/json');

$action = $_REQUEST['action'] ?? '';

switch ($action) {

  //  LISTAR USUARIOS
  case 'list':
    $res = $conn->query("SELECT id, nombre, correo, rol FROM usuarios ORDER BY id DESC");
    if(!$res){
        echo json_encode(['ok'=>false, 'error'=>$conn->error]);
        exit;
    }
    echo json_encode($res->fetch_all(MYSQLI_ASSOC));
    break;

  //  CREAR USUARIO
  case 'create':
    $nombre = trim($_POST['nombre'] ?? '');
    $correo = strtolower(trim($_POST['correo'] ?? ''));
    $password = $_POST['password'] ?? '';
    $rol = strtolower(trim($_POST['rol'] ?? ''));

    if (!preg_match('/^[a-zA-Z0-9._%+-]+@elpoli\.edu\.co$/', $correo)) {
      echo json_encode(['ok'=>false, 'error'=>'Solo se permiten correos institucionales @elpoli.edu.co']);
      exit;
    }

    // Verificar duplicado
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE correo = ?");
    $stmt->bind_param("s", $correo);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res->num_rows > 0) {
      echo json_encode(['ok'=>false, 'error'=>'El correo ya está registrado.']);
      exit;
    }

    // Crear usuario
    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $nombre, $correo, $hash, $rol);
    $ok = $stmt->execute();

    echo json_encode(['ok'=>$ok]);
    break;

  // 🔹 ELIMINAR USUARIO
  case 'delete':
    $id = intval($_POST['id'] ?? 0);
    $stmt = $conn->prepare("DELETE FROM usuarios WHERE id=?");
    $stmt->bind_param("i", $id);
    $ok = $stmt->execute();
    echo json_encode(['ok'=>$ok]);
    break;

  default:
    echo json_encode(['ok'=>false, 'error'=>'Acción no válida']);
}
?>
