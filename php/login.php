<?php
header('Content-Type: application/json');
include('conexion.php');
session_start();
$input = json_decode(file_get_contents('php://input'), true);
$correo = $conn->real_escape_string($input['correo']);
$password = $conn->real_escape_string($input['password']);
$res = $conn->query("SELECT id,nombre,correo,rol FROM usuarios WHERE correo='$correo' AND password='$password' LIMIT 1");
if($res && $res->num_rows>0){
  $u = $res->fetch_assoc();
  $_SESSION['user_id']=$u['id'];
  $_SESSION['user_nombre']=$u['nombre'];
  $_SESSION['user_rol']=$u['rol'];
  echo json_encode(['success'=>true,'nombre'=>$u['nombre'],'rol'=>$u['rol']]);
} else {
  echo json_encode(['success'=>false]);
}
?>