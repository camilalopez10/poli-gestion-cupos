<?php
// Reemplazo sugerido para php/class.work.php compatible PHP 8.2
class WorkDB {
    private mysqli $conn;

    public function __construct() {
        $host = '127.0.0.1';
        $user = 'root';
        $pass = '';
        $db   = 'poli_gestion';
        $this->conn = new mysqli($host, $user, $pass, $db);
        if ($this->conn->connect_errno) {
            die('Error de conexión MySQL: ' . $this->conn->connect_error);
        }
        $this->conn->set_charset('utf8mb4');
    }

    public function getConnection(): mysqli {
        return $this->conn;
    }

    public function obtenerAsignaturas(): array {
        $sql = "SELECT codigo, nombre FROM asignaturas ORDER BY codigo";
        $res = $this->conn->query($sql);
        $out = [];
        if ($res) {
            while ($row = $res->fetch_assoc()) {
                $out[] = $row;
            }
            $res->free();
        }
        return $out;
    }

    public function crearUsuario(string $nombre, string $correo, string $password, string $rol = 'Coordinador'): array {
        if (!preg_match('/@elpoli\.edu\.co$/', $correo)) {
            return ['ok' => false, 'msg' => 'El correo debe finalizar en @elpoli.edu.co'];
        }
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $this->conn->prepare("INSERT INTO usuarios (nombre, correo, password, rol, activo) VALUES (?, ?, ?, ?, 1)");
        if (!$stmt) return ['ok' => false, 'msg' => 'Error prepare: ' . $this->conn->error];
        $stmt->bind_param('ssss', $nombre, $correo, $hash, $rol);
        $exec = $stmt->execute();
        if (!$exec) {
            $err = $stmt->error;
            $stmt->close();
            return ['ok' => false, 'msg' => 'Error execute: ' . $err];
        }
        $stmt->close();
        return ['ok' => true, 'msg' => 'Usuario creado correctamente'];
    }

    public function registrarEstimacion(array $fila): array {
        $stmt = $this->conn->prepare("INSERT INTO estimaciones (codigo_asignatura, periodo, tasa_aprobacion, tasa_reprobacion, transferencia_interna, transferencia_externa, cupos_previos, cupos_estimados) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        if (!$stmt) return ['ok' => false, 'msg' => 'Error prepare: ' . $this->conn->error];
        $stmt->bind_param('ssddddii',
            $fila['codigo_asignatura'],
            $fila['periodo'],
            $fila['tasa_aprobacion'],
            $fila['tasa_reprobacion'],
            $fila['transferencia_interna'],
            $fila['transferencia_externa'],
            $fila['cupos_previos'],
            $fila['cupos_estimados']
        );
        $exec = $stmt->execute();
        if (!$exec) {
            $err = $stmt->error;
            $stmt->close();
            return ['ok' => false, 'msg' => 'Error execute: ' . $err];
        }
        $stmt->close();
        return ['ok' => true, 'msg' => 'Estimación registrada'];
    }

    public function guardarResultadosBatch(array $filas): array {
        $this->conn->begin_transaction();
        foreach ($filas as $fila) {
            $res = $this->registrarEstimacion($fila);
            if (!$res['ok']) {
                $this->conn->rollback();
                return ['ok' => false, 'msg' => $res['msg']];
            }
        }
        $this->conn->commit();
        return ['ok' => true, 'msg' => 'Todas las estimaciones guardadas'];
    }
}
?>