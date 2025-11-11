-- schema minimal
CREATE TABLE IF NOT EXISTS asignaturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE,
  nombre VARCHAR(200),
  creditos INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS aulas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150),
  capacidad INT,
  ubicacion VARCHAR(150),
  tipo VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS programas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS programa_asignaturas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  programa_id INT,
  asignatura_id INT,
  UNIQUE KEY (programa_id, asignatura_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS requisitos_asignatura (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asignatura_id INT,
  requisito_asignatura_id INT,
  tipo ENUM('pre','co') DEFAULT 'pre'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS cupos_estimados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  asignatura VARCHAR(200),
  anio INT,
  periodo VARCHAR(20),
  cupos_calculados INT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
