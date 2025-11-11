<?php
// includes/logger.php
require_once __DIR__ . '/../php/conexion.php';
require_once __DIR__ . '/auth.php';

function log_change($modulo, $descripcion, $referencia_id = NULL){
    global $conn;
    $usuario = current_user();
    $usuario_id = $usuario['id'] ?? NULL;
    $stmt = $conn->prepare("INSERT INTO cambios_historial (usuario_id, modulo, referencia_id, descripcion) VALUES (?,?,?,?)");
    $stmt->bind_param("siss", $usuario_id, $modulo, $referencia_id, $descripcion);
    $stmt->execute();
}
