<?php
function log_change($conn, $usuario_id, $modulo, $accion, $descripcion = '') {
    $stmt = $conn->prepare("INSERT INTO historial_cambios (usuario_id, modulo, accion, descripcion) VALUES (?, ?, ?, ?)");
    if(!$stmt) return false;
    $stmt->bind_param("isss", $usuario_id, $modulo, $accion, $descripcion);
    $ok = $stmt->execute();
    $stmt->close();
    return $ok;
}
?>