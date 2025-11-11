<?php
// class/auth_check.php
// Central auth check - supports roles: admin, academico
if(session_status() === PHP_SESSION_NONE) session_start();

if(!isset($_SESSION['user_id'])){
    header("Location: /poli-gestion-cupos/index.html");
    exit;
}
$rol = $_SESSION['rol'] ?? 'academico';

function can_access($module){
    global $rol;
    // admin: full access
    if($rol === 'admin') return true;
    // academico: all modules except gestion_usuarios
    if($rol === 'academico'){
        if($module === 'gestion_usuarios') return false;
        return true;
    }
    return false;
}
?>