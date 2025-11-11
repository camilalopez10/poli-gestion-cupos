<?php
// includes/admin_only.php
require_once __DIR__ . '/auth.php';
require_login();
if (!is_admin()){
    http_response_code(403);
    echo "Acceso restringido. Solo administradores.";
    exit;
}
