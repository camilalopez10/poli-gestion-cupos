<?php
// includes/auth.php
session_start();
require_once __DIR__ . '/../php/conexion.php';

function login_user($email, $password){
    global $conn;
    $sql = "SELECT id, password_hash, rol, nombre, email FROM usuarios WHERE email = ? LIMIT 1";
    if($stmt = $conn->prepare($sql)){
        $stmt->bind_param("s",$email);
        $stmt->execute();
        $stmt->bind_result($id,$hash,$rol,$nombre,$mail);
        if($stmt->fetch()){
            if (password_verify($password, $hash)){
                $_SESSION['user_id'] = $id;
                $_SESSION['user_name'] = $nombre;
                $_SESSION['user_role'] = $rol;
                $_SESSION['user_email'] = $mail;
                return true;
            }
        }
    }
    return false;
}

function require_login(){
    if (empty($_SESSION['user_id'])){
        header('Location: /poli-gestion-cupos/forgot_password.php'); // adjust if needed
        exit;
    }
}

function current_user(){
    if (!empty($_SESSION['user_id'])){
        return [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'] ?? null,
            'role' => $_SESSION['user_role'] ?? 'usuario',
            'email' => $_SESSION['user_email'] ?? null
        ];
    }
    return null;
}

function is_admin(){
    return (isset($_SESSION['user_role']) && $_SESSION['user_role'] === 'admin');
}
