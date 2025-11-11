<?php
session_start();
if (!isset($_SESSION['user'])) {
    http_response_code(403);
    echo "Acceso denegado.";
    exit();
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Historial de Cambios</title>
<style>
body {
    font-family: Arial, sans-serif;
    background: #f4f6f5;
    margin: 0;
}
.container {
    max-width: 550px;
    margin: 60px auto;
    background: #fff;
    padding: 25px 30px;
    border-radius: 10px;
    box-shadow: 0 6px 15px rgba(0,0,0,0.1);
}
h2 {
    color: #2E7D32;
    margin-bottom: 20px;
}
.form-group {
    margin-bottom: 15px;
}
label {
    display: block;
    font-weight: bold;
    color: #333;
    margin-bottom: 6px;
}
input[type="text"],
input[type="date"] {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
    font-size: 14px;
}
button {
    background: #2E7D32;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 6px;
    font-size: 15px;
    cursor: pointer;
    width: 100%;
    transition: background 0.3s;
}
button:hover {
    background: #1B5E20;
}
.btn-secondary {
    margin-top: 10px;
    background: #555;
}
.btn-secondary:hover {
    background: #333;
}
</style>
</head>
<body>

<div class="container">
    <h2>Historial de Cambios</h2>
    <form>
        <div class="form-group">
            <label for="usuario">Usuario:</label>
            <input type="text" id="usuario" name="usuario" placeholder="Nombre o correo del usuario">
        </div>

        <div class="form-group">
            <label for="fecha_desde">Fecha desde:</label>
            <input type="date" id="fecha_desde" name="fecha_desde">
        </div>

        <div class="form-group">
            <label for="fecha_hasta">Fecha hasta:</label>
            <input type="date" id="fecha_hasta" name="fecha_hasta">
        </div>

        <button type="button">Buscar Cambios</button>
        <button type="button" class="btn-secondary" onclick="window.history.back()">Volver a Inicio</button>
    </form>
</div>

</body>
</html>
