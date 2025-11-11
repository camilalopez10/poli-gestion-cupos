<?php
// class/funciones_auditoria.php
// Helper para registrar acciones en historial_cambios
function registrar_accion($conn, $usuario_id, $modulo, $accion, $descripcion = null) {
    if (!$conn) return false;
    $stmt = $conn->prepare("INSERT INTO historial_cambios (usuario_id, modulo, accion, descripcion) VALUES (?, ?, ?, ?)");
    if (!$stmt) return false;
    $stmt->bind_param("isss", $usuario_id, $modulo, $accion, $descripcion);
    $res = $stmt->execute();
    $stmt->close();
    return $res;
}
?>
