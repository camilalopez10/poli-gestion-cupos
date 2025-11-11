-- Dump creado automáticamente con datos de ejemplo para pruebas
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
START TRANSACTION;
SET time_zone = '+00:00';
CREATE DATABASE IF NOT EXISTS `poli_gestion`;
USE `poli_gestion`;

CREATE TABLE IF NOT EXISTS asignaturas (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(200) NOT NULL,
  creditos INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS aulas (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150),
  capacidad INT DEFAULT 0,
  ubicacion VARCHAR(150),
  tipo VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS usuarios (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(200) NOT NULL,
  rol ENUM('admin','docente','coordinador') DEFAULT 'docente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS matriculas_historicas (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  codigo_asignatura VARCHAR(50) NOT NULL,
  anio INT NOT NULL,
  periodo VARCHAR(20) NOT NULL,
  matriculados INT DEFAULT 0,
  aprobados INT DEFAULT 0,
  reprobados INT DEFAULT 0,
  cancelaciones INT DEFAULT 0,
  reingresos INT DEFAULT 0,
  transferencia_interna INT DEFAULT 0,
  transferencia_externa INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS estimaciones (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  codigo_asignatura VARCHAR(50) NOT NULL,
  periodo VARCHAR(20),
  tasa_aprobacion DECIMAL(5,2) DEFAULT 0.00,
  tasa_reprobacion DECIMAL(5,2) DEFAULT 0.00,
  transferencia_interna DECIMAL(5,2) DEFAULT 0.00,
  transferencia_externa DECIMAL(5,2) DEFAULT 0.00,
  cupos_previos INT DEFAULT 0,
  cupos_estimados INT DEFAULT 0,
  fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS cupos_estimados (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  codigo_asignatura VARCHAR(50) NOT NULL,
  anio INT,
  periodo VARCHAR(20),
  cupos_calculados INT DEFAULT 0,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS programas (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS programa_asignaturas (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  programa_id INT,
  asignatura_id INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


CREATE TABLE IF NOT EXISTS historial_cambios (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT DEFAULT NULL,
  modulo VARCHAR(100) NOT NULL,
  accion VARCHAR(50) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO programas (nombre) VALUES ('Ingeniería Informática');
INSERT INTO programas (nombre) VALUES ('Contaduría Pública');
INSERT INTO programas (nombre) VALUES ('Administración de Empresas');
INSERT INTO programas (nombre) VALUES ('Ingeniería Industrial');
INSERT INTO programas (nombre) VALUES ('Tecnología en Sistemas');
INSERT INTO asignaturas (codigo,nombre,creditos) VALUES ('ADM202','Fundamentos de Administración',3);
INSERT INTO asignaturas (codigo,nombre,creditos) VALUES ('INF105','Programación Básica',4);
INSERT INTO asignaturas (codigo,nombre,creditos) VALUES ('INF210','Bases de Datos',4);
INSERT INTO asignaturas (codigo,nombre,creditos) VALUES ('MAT202','Álgebra Lineal',4);
INSERT INTO asignaturas (codigo,nombre,creditos) VALUES ('CON301','Contabilidad General',3);
INSERT INTO asignaturas (codigo,nombre,creditos) VALUES ('INF305','Programación Orientada a Objetos',4);
INSERT INTO asignaturas (codigo,nombre,creditos) VALUES ('RED101','Redes de Computadores',3);
INSERT INTO asignaturas (codigo,nombre,creditos) VALUES ('EST201','Estadística Aplicada',3);
INSERT INTO asignaturas (codigo,nombre,creditos) VALUES ('ETI100','Ética Profesional',2);
INSERT INTO asignaturas (codigo,nombre,creditos) VALUES ('SIS220','Análisis y Diseño de Sistemas',4);
INSERT INTO asignaturas (codigo,nombre,creditos) VALUES ('SEG330','Seguridad Informática',3);
INSERT INTO asignaturas (codigo,nombre,creditos) VALUES ('WEB150','Desarrollo Web',3);
INSERT INTO asignaturas (codigo,nombre,creditos) VALUES ('BDM400','Modelado de Datos',3);
INSERT INTO asignaturas (codigo,nombre,creditos) VALUES ('ADM301','Gestión de Proyectos',3);
INSERT INTO asignaturas (codigo,nombre,creditos) VALUES ('IOT101','Fundamentos de IoT',2);
INSERT INTO aulas (nombre,capacidad,ubicacion) VALUES ('Lab 101',30,'Bloque A');
INSERT INTO aulas (nombre,capacidad,ubicacion) VALUES ('Aula 202',40,'Bloque B');
INSERT INTO aulas (nombre,capacidad,ubicacion) VALUES ('Lab 102',25,'Bloque A');
INSERT INTO aulas (nombre,capacidad,ubicacion) VALUES ('Aula 303',35,'Bloque C');
INSERT INTO aulas (nombre,capacidad,ubicacion) VALUES ('Lab 201',20,'Bloque B');
INSERT INTO aulas (nombre,capacidad,ubicacion) VALUES ('Aula 101',45,'Bloque A');
INSERT INTO aulas (nombre,capacidad,ubicacion) VALUES ('Aula 102',40,'Bloque A');
INSERT INTO aulas (nombre,capacidad,ubicacion) VALUES ('Auditorio',120,'Edificio Central');
INSERT INTO aulas (nombre,capacidad,ubicacion) VALUES ('Sala TIC',20,'Bloque C');
INSERT INTO aulas (nombre,capacidad,ubicacion) VALUES ('Aula 404',30,'Bloque D');
INSERT INTO usuarios (nombre,correo,password,rol) VALUES ('Admin','admin@elpoli.edu.co','1234','admin');
INSERT INTO usuarios (nombre,correo,password,rol) VALUES ('María Coordinador','maria.coordinador@elpoli.edu.co','pass123','coordinador');
INSERT INTO usuarios (nombre,correo,password,rol) VALUES ('Luis Coordinador','luis.coordinador@elpoli.edu.co','pass123','coordinador');
INSERT INTO usuarios (nombre,correo,password,rol) VALUES ('Juan Docente','juan.docente@elpoli.edu.co','doc123','docente');
INSERT INTO usuarios (nombre,correo,password,rol) VALUES ('Ana Docente','ana.docente@elpoli.edu.co','doc123','docente');
INSERT INTO usuarios (nombre,correo,password,rol) VALUES ('Carlos Docente','carlos.docente@elpoli.edu.co','doc123','docente');
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('ADM301',2023,'1',29,22,2,2,0,2,2);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('IOT101',2023,'1',114,92,19,3,3,1,1);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('INF305',2024,'1',59,37,18,4,1,1,2);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('BDM400',2025,'2',55,40,10,1,0,0,2);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('SEG330',2024,'2',94,80,12,5,3,0,2);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('SEG330',2023,'2',49,28,16,0,0,3,0);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('IOT101',2023,'1',108,72,36,0,1,3,1);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('RED101',2025,'1',67,35,31,3,1,1,1);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('SEG330',2025,'2',30,22,5,0,3,1,0);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('INF210',2025,'1',28,15,11,4,3,1,1);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('INF305',2023,'2',70,52,13,4,1,3,2);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('RED101',2024,'1',104,89,10,1,0,0,0);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('INF105',2024,'1',46,28,16,0,3,0,2);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('ADM202',2024,'1',86,60,25,0,0,1,2);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('WEB150',2024,'1',119,97,21,2,0,2,0);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('BDM400',2025,'1',87,44,43,1,0,1,2);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('ADM301',2024,'2',36,23,11,5,1,1,2);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('SIS220',2024,'2',30,26,0,4,1,1,0);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('BDM400',2023,'2',64,46,17,4,1,0,0);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('INF305',2024,'1',117,86,28,0,2,3,2);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('MAT202',2024,'1',58,33,20,4,1,0,1);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('ADM301',2023,'2',47,38,5,5,1,1,2);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('ADM301',2025,'1',21,17,0,4,2,1,0);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('RED101',2024,'2',73,61,11,3,3,1,0);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('MAT202',2023,'2',37,28,8,0,1,1,2);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('BDM400',2024,'2',95,62,28,0,1,2,1);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('CON301',2023,'1',102,78,24,4,0,1,1);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('MAT202',2025,'2',119,93,26,1,3,1,1);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('SIS220',2023,'1',95,63,31,2,0,0,1);
INSERT INTO matriculas_historicas (codigo_asignatura,anio,periodo,matriculados,aprobados,reprobados,cancelaciones,reingresos,transferencia_interna,transferencia_externa) VALUES ('SEG330',2024,'2',44,23,20,3,1,1,2);
INSERT INTO estimaciones (codigo_asignatura,periodo,tasa_aprobacion,tasa_reprobacion,transferencia_interna,transferencia_externa,cupos_previos,cupos_estimados) VALUES ('ADM202','2025-2',59.37,39.83,3.12,2.06,38,36);
INSERT INTO cupos_estimados (codigo_asignatura,anio,periodo,cupos_calculados) VALUES ('ADM202',2025,'2',36);
INSERT INTO estimaciones (codigo_asignatura,periodo,tasa_aprobacion,tasa_reprobacion,transferencia_interna,transferencia_externa,cupos_previos,cupos_estimados) VALUES ('INF105','2025-2',62.78,36.41,1.4,2.64,42,40);
INSERT INTO cupos_estimados (codigo_asignatura,anio,periodo,cupos_calculados) VALUES ('INF105',2025,'2',40);
INSERT INTO estimaciones (codigo_asignatura,periodo,tasa_aprobacion,tasa_reprobacion,transferencia_interna,transferencia_externa,cupos_previos,cupos_estimados) VALUES ('INF210','2025-2',63.64,34.09,1.45,2.76,48,46);
INSERT INTO cupos_estimados (codigo_asignatura,anio,periodo,cupos_calculados) VALUES ('INF210',2025,'2',46);
INSERT INTO estimaciones (codigo_asignatura,periodo,tasa_aprobacion,tasa_reprobacion,transferencia_interna,transferencia_externa,cupos_previos,cupos_estimados) VALUES ('MAT202','2025-2',81.38,16.35,0.99,0.31,50,56);
INSERT INTO cupos_estimados (codigo_asignatura,anio,periodo,cupos_calculados) VALUES ('MAT202',2025,'2',56);
INSERT INTO estimaciones (codigo_asignatura,periodo,tasa_aprobacion,tasa_reprobacion,transferencia_interna,transferencia_externa,cupos_previos,cupos_estimados) VALUES ('CON301','2025-2',78.46,14.31,3.29,2.21,33,37);
INSERT INTO cupos_estimados (codigo_asignatura,anio,periodo,cupos_calculados) VALUES ('CON301',2025,'2',37);
INSERT INTO estimaciones (codigo_asignatura,periodo,tasa_aprobacion,tasa_reprobacion,transferencia_interna,transferencia_externa,cupos_previos,cupos_estimados) VALUES ('INF305','2025-2',73.15,25.39,2.18,2.73,30,32);
INSERT INTO cupos_estimados (codigo_asignatura,anio,periodo,cupos_calculados) VALUES ('INF305',2025,'2',32);
INSERT INTO estimaciones (codigo_asignatura,periodo,tasa_aprobacion,tasa_reprobacion,transferencia_interna,transferencia_externa,cupos_previos,cupos_estimados) VALUES ('RED101','2025-2',58.03,37.87,4.9,2.98,31,30);
INSERT INTO cupos_estimados (codigo_asignatura,anio,periodo,cupos_calculados) VALUES ('RED101',2025,'2',30);
INSERT INTO estimaciones (codigo_asignatura,periodo,tasa_aprobacion,tasa_reprobacion,transferencia_interna,transferencia_externa,cupos_previos,cupos_estimados) VALUES ('EST201','2025-2',74.71,15.49,1.41,1.65,48,51);
INSERT INTO cupos_estimados (codigo_asignatura,anio,periodo,cupos_calculados) VALUES ('EST201',2025,'2',51);
INSERT INTO estimaciones (codigo_asignatura,periodo,tasa_aprobacion,tasa_reprobacion,transferencia_interna,transferencia_externa,cupos_previos,cupos_estimados) VALUES ('ETI100','2025-2',84.03,11.77,2.14,1.16,38,44);
INSERT INTO cupos_estimados (codigo_asignatura,anio,periodo,cupos_calculados) VALUES ('ETI100',2025,'2',44);
INSERT INTO estimaciones (codigo_asignatura,periodo,tasa_aprobacion,tasa_reprobacion,transferencia_interna,transferencia_externa,cupos_previos,cupos_estimados) VALUES ('SIS220','2025-2',58.15,38.01,4.36,2.88,45,43);
INSERT INTO cupos_estimados (codigo_asignatura,anio,periodo,cupos_calculados) VALUES ('SIS220',2025,'2',43);
INSERT INTO estimaciones (codigo_asignatura,periodo,tasa_aprobacion,tasa_reprobacion,transferencia_interna,transferencia_externa,cupos_previos,cupos_estimados) VALUES ('SEG330','2025-2',83.35,9.77,0.74,2.73,34,39);
INSERT INTO cupos_estimados (codigo_asignatura,anio,periodo,cupos_calculados) VALUES ('SEG330',2025,'2',39);
INSERT INTO estimaciones (codigo_asignatura,periodo,tasa_aprobacion,tasa_reprobacion,transferencia_interna,transferencia_externa,cupos_previos,cupos_estimados) VALUES ('WEB150','2025-2',64.22,30.2,4.22,1.36,31,31);
INSERT INTO cupos_estimados (codigo_asignatura,anio,periodo,cupos_calculados) VALUES ('WEB150',2025,'2',31);
INSERT INTO estimaciones (codigo_asignatura,periodo,tasa_aprobacion,tasa_reprobacion,transferencia_interna,transferencia_externa,cupos_previos,cupos_estimados) VALUES ('BDM400','2025-2',76.78,20.07,0.64,2.3,20,21);
INSERT INTO cupos_estimados (codigo_asignatura,anio,periodo,cupos_calculados) VALUES ('BDM400',2025,'2',21);
INSERT INTO estimaciones (codigo_asignatura,periodo,tasa_aprobacion,tasa_reprobacion,transferencia_interna,transferencia_externa,cupos_previos,cupos_estimados) VALUES ('ADM301','2025-2',81.5,10.54,0.48,2.28,58,65);
INSERT INTO cupos_estimados (codigo_asignatura,anio,periodo,cupos_calculados) VALUES ('ADM301',2025,'2',65);
INSERT INTO estimaciones (codigo_asignatura,periodo,tasa_aprobacion,tasa_reprobacion,transferencia_interna,transferencia_externa,cupos_previos,cupos_estimados) VALUES ('IOT101','2025-2',63.78,33.6,3.41,1.05,30,30);
INSERT INTO cupos_estimados (codigo_asignatura,anio,periodo,cupos_calculados) VALUES ('IOT101',2025,'2',30);
INSERT INTO historial_cambios (usuario_id,modulo,accion,descripcion) VALUES (1,'Asignaturas','Creación','Se crearon asignaturas iniciales');
INSERT INTO historial_cambios (usuario_id,modulo,accion,descripcion) VALUES (2,'Usuarios','Creación','Usuario admin creado');
INSERT INTO historial_cambios (usuario_id,modulo,accion,descripcion) VALUES (1,'Importación','Importación','Importación inicial de asignaturas desde CSV');
INSERT INTO historial_cambios (usuario_id,modulo,accion,descripcion) VALUES (3,'Estimaciones','Cálculo','Estimación automática de cupos realizada');
COMMIT;