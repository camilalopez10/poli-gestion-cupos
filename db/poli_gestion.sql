-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 03-11-2025 a las 16:58:40
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `poli_gestion`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asignaturas`
--

CREATE TABLE `asignaturas` (
  `id` int(11) NOT NULL,
  `codigo` varchar(50) DEFAULT NULL,
  `nombre` varchar(200) DEFAULT NULL,
  `creditos` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `asignaturas`
--

INSERT INTO `asignaturas` (`id`, `codigo`, `nombre`, `creditos`) VALUES
(2, 'ADM202;Fundamentos de Administración;Administració', '', 0),
(3, 'INF105;Programación Básica;Ingeniería Informática;', '', 0),
(4, 'CON301;Contabilidad General;Contaduría Pública;3;2', '', 0),
(5, 'ING205;Inglés II;Ingeniería Industrial;2;2025-1', '', 0),
(6, 'ECO210;Economía y Empresa;Administración de Empres', '', 0),
(7, 'EST302;Estadística;Ingeniería Industrial;3;2025-1', '', 0),
(8, 'INF210;Bases de Datos;Ingeniería Informática;4;202', '', 0),
(9, 'MAT202;Álgebra Lineal;Ingeniería Industrial;3;2025', '', 0),
(10, 'CON220;Normas Internacionales de Información Finan', '', 0),
(11, 'MAT101;Cálculo I;Ingeniería Industrial;4;2025-1', '', 0),
(12, 'ADM202;Fundamentos de Administración;Administració', '', 0),
(13, 'INF105;Programación Básica;Ingeniería Informática;', '', 0),
(14, 'CON301;Contabilidad General;Contaduría Pública;3;2', '', 0),
(15, 'ING205;Inglés II;Ingeniería Industrial;2;2025-1', '', 0),
(16, 'ECO210;Economía y Empresa;Administración de Empres', '', 0),
(17, 'EST302;Estadística;Ingeniería Industrial;3;2025-1', '', 0),
(18, 'INF210;Bases de Datos;Ingeniería Informática;4;202', '', 0),
(19, 'MAT202;Álgebra Lineal;Ingeniería Industrial;3;2025', '', 0),
(20, 'CON220;Normas Internacionales de Información Finan', '', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `aulas`
--

CREATE TABLE `aulas` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) DEFAULT NULL,
  `capacidad` int(11) DEFAULT NULL,
  `ubicacion` varchar(150) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `aulas`
--

INSERT INTO `aulas` (`id`, `nombre`, `capacidad`, `ubicacion`, `tipo`) VALUES
(1, 'Cálculo I;2024-1;30;28', 0, '', ''),
(2, 'Cálculo I;2024-2;30;32', 0, '', ''),
(3, 'Cálculo I;2025-1;35;33', 0, '', ''),
(4, 'Programación Básica;2024-1;25;22', 0, '', ''),
(5, 'Programación Básica;2024-2;25;27', 0, '', ''),
(6, 'Programación Básica;2025-1;30;29', 0, '', ''),
(7, 'Contabilidad General;2024-1;35;33', 0, '', ''),
(8, 'Contabilidad General;2024-2;35;36', 0, '', ''),
(9, 'Contabilidad General;2025-1;38;37', 0, '', ''),
(10, 'Fundamentos de Administración;2024-1;40;38', 0, '', ''),
(11, 'Fundamentos de Administración;2024-2;40;41', 0, '', ''),
(12, 'Fundamentos de Administración;2025-1;42;40', 0, '', '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cupos_estimados`
--

CREATE TABLE `cupos_estimados` (
  `id` int(11) NOT NULL,
  `asignatura` varchar(200) DEFAULT NULL,
  `anio` int(11) DEFAULT NULL,
  `periodo` varchar(20) DEFAULT NULL,
  `cupos_calculados` int(11) DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cupos_estimados`
--

INSERT INTO `cupos_estimados` (`id`, `asignatura`, `anio`, `periodo`, `cupos_calculados`, `fecha`) VALUES
(1, 'Cálculo I', 2025, '1', 8, '2025-11-02 02:56:55'),
(2, 'Física I', 2025, '1', 8, '2025-11-02 02:56:55'),
(3, 'Química General', 2025, '2', 5, '2025-11-02 02:56:55'),
(4, 'Programación I', 2025, '1', 12, '2025-11-02 02:56:55'),
(5, 'Estadística', 2025, '2', 5, '2025-11-02 02:56:55'),
(6, 'Historia Universal', 2025, '1', 12, '2025-11-02 02:56:55'),
(7, 'Electrónica Básica', 2025, '2', 6, '2025-11-02 02:56:55'),
(8, 'Filosofía', 2025, '1', 5, '2025-11-02 02:56:55'),
(9, 'Bases de Datos', 2025, '2', 5, '2025-11-02 02:56:55'),
(10, 'Matemáticas Discretas', 2025, '2', 7, '2025-11-02 02:56:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_cambios`
--

CREATE TABLE `historial_cambios` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) DEFAULT NULL,
  `modulo` varchar(100) NOT NULL,
  `accion` varchar(50) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `indicadores_historicos`
--

CREATE TABLE `indicadores_historicos` (
  `id` int(11) NOT NULL,
  `asignatura_id` int(11) NOT NULL,
  `periodo` varchar(50) NOT NULL,
  `matriculados` int(11) DEFAULT 0,
  `aprobados` int(11) DEFAULT 0,
  `reprobados` int(11) DEFAULT 0,
  `cancelados` int(11) DEFAULT 0,
  `desercion` int(11) DEFAULT 0,
  `tasa_aprobacion` decimal(8,4) DEFAULT 0.0000,
  `tasa_reprobacion` decimal(8,4) DEFAULT 0.0000,
  `tasa_cancelacion` decimal(8,4) DEFAULT 0.0000,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `matriculas_historicas`
--

CREATE TABLE `matriculas_historicas` (
  `id` int(11) NOT NULL,
  `asignatura` varchar(200) DEFAULT NULL,
  `anio` int(11) DEFAULT NULL,
  `periodo` varchar(20) DEFAULT NULL,
  `matriculados` int(11) DEFAULT 0,
  `aprobados` int(11) DEFAULT 0,
  `reprobados` int(11) DEFAULT 0,
  `cancelaciones` int(11) DEFAULT 0,
  `deserciones` int(11) DEFAULT 0,
  `reingresos` int(11) DEFAULT 0,
  `transferencias` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `matriculas_historicas`
--

INSERT INTO `matriculas_historicas` (`id`, `asignatura`, `anio`, `periodo`, `matriculados`, `aprobados`, `reprobados`, `cancelaciones`, `deserciones`, `reingresos`, `transferencias`) VALUES
(1, 'Cálculo I;2024-1;30;28', 0, '', 0, 0, 0, 0, 0, 0, 0),
(2, 'Cálculo I;2024-2;30;32', 0, '', 0, 0, 0, 0, 0, 0, 0),
(3, 'Cálculo I;2025-1;35;33', 0, '', 0, 0, 0, 0, 0, 0, 0),
(4, 'Programación Básica;2024-1;25;22', 0, '', 0, 0, 0, 0, 0, 0, 0),
(5, 'Programación Básica;2024-2;25;27', 0, '', 0, 0, 0, 0, 0, 0, 0),
(6, 'Programación Básica;2025-1;30;29', 0, '', 0, 0, 0, 0, 0, 0, 0),
(7, 'Contabilidad General;2024-1;35;33', 0, '', 0, 0, 0, 0, 0, 0, 0),
(8, 'Contabilidad General;2024-2;35;36', 0, '', 0, 0, 0, 0, 0, 0, 0),
(9, 'Contabilidad General;2025-1;38;37', 0, '', 0, 0, 0, 0, 0, 0, 0),
(10, 'Fundamentos de Administración;2024-1;40;38', 0, '', 0, 0, 0, 0, 0, 0, 0),
(11, 'Fundamentos de Administración;2024-2;40;41', 0, '', 0, 0, 0, 0, 0, 0, 0),
(12, 'Fundamentos de Administración;2025-1;42;40', 0, '', 0, 0, 0, 0, 0, 0, 0),
(13, 'Cálculo I;2024-1;30;28', 0, '', 0, 0, 0, 0, 0, 0, 0),
(14, 'Cálculo I;2024-2;30;32', 0, '', 0, 0, 0, 0, 0, 0, 0),
(15, 'Cálculo I;2025-1;35;33', 0, '', 0, 0, 0, 0, 0, 0, 0),
(16, 'Programación Básica;2024-1;25;22', 0, '', 0, 0, 0, 0, 0, 0, 0),
(17, 'Programación Básica;2024-2;25;27', 0, '', 0, 0, 0, 0, 0, 0, 0),
(18, 'Programación Básica;2025-1;30;29', 0, '', 0, 0, 0, 0, 0, 0, 0),
(19, 'Contabilidad General;2024-1;35;33', 0, '', 0, 0, 0, 0, 0, 0, 0),
(20, 'Contabilidad General;2024-2;35;36', 0, '', 0, 0, 0, 0, 0, 0, 0),
(21, 'Contabilidad General;2025-1;38;37', 0, '', 0, 0, 0, 0, 0, 0, 0),
(22, 'Fundamentos de Administración;2024-1;40;38', 0, '', 0, 0, 0, 0, 0, 0, 0),
(23, 'Fundamentos de Administración;2024-2;40;41', 0, '', 0, 0, 0, 0, 0, 0, 0),
(24, 'Fundamentos de Administración;2025-1;42;40', 0, '', 0, 0, 0, 0, 0, 0, 0),
(25, 'Cálculo I;2024-1;30;28', 0, '', 0, 0, 0, 0, 0, 0, 0),
(26, 'Cálculo I;2024-2;30;32', 0, '', 0, 0, 0, 0, 0, 0, 0),
(27, 'Cálculo I;2025-1;35;33', 0, '', 0, 0, 0, 0, 0, 0, 0),
(28, 'Programación Básica;2024-1;25;22', 0, '', 0, 0, 0, 0, 0, 0, 0),
(29, 'Programación Básica;2024-2;25;27', 0, '', 0, 0, 0, 0, 0, 0, 0),
(30, 'Programación Básica;2025-1;30;29', 0, '', 0, 0, 0, 0, 0, 0, 0),
(31, 'Contabilidad General;2024-1;35;33', 0, '', 0, 0, 0, 0, 0, 0, 0),
(32, 'Contabilidad General;2024-2;35;36', 0, '', 0, 0, 0, 0, 0, 0, 0),
(33, 'Contabilidad General;2025-1;38;37', 0, '', 0, 0, 0, 0, 0, 0, 0),
(34, 'Fundamentos de Administración;2024-1;40;38', 0, '', 0, 0, 0, 0, 0, 0, 0),
(35, 'Fundamentos de Administración;2024-2;40;41', 0, '', 0, 0, 0, 0, 0, 0, 0),
(36, 'Fundamentos de Administración;2025-1;42;40', 0, '', 0, 0, 0, 0, 0, 0, 0),
(37, 'Cálculo I;2024-1;30;28', 0, '', 0, 0, 0, 0, 0, 0, 0),
(38, 'Cálculo I;2024-2;30;32', 0, '', 0, 0, 0, 0, 0, 0, 0),
(39, 'Cálculo I;2025-1;35;33', 0, '', 0, 0, 0, 0, 0, 0, 0),
(40, 'Programación Básica;2024-1;25;22', 0, '', 0, 0, 0, 0, 0, 0, 0),
(41, 'Programación Básica;2024-2;25;27', 0, '', 0, 0, 0, 0, 0, 0, 0),
(42, 'Programación Básica;2025-1;30;29', 0, '', 0, 0, 0, 0, 0, 0, 0),
(43, 'Contabilidad General;2024-1;35;33', 0, '', 0, 0, 0, 0, 0, 0, 0),
(44, 'Contabilidad General;2024-2;35;36', 0, '', 0, 0, 0, 0, 0, 0, 0),
(45, 'Contabilidad General;2025-1;38;37', 0, '', 0, 0, 0, 0, 0, 0, 0),
(46, 'Fundamentos de Administración;2024-1;40;38', 0, '', 0, 0, 0, 0, 0, 0, 0),
(47, 'Fundamentos de Administración;2024-2;40;41', 0, '', 0, 0, 0, 0, 0, 0, 0),
(48, 'Fundamentos de Administración;2025-1;42;40', 0, '', 0, 0, 0, 0, 0, 0, 0),
(49, 'Cálculo I;2024-1;30;28', 0, '', 0, 0, 0, 0, 0, 0, 0),
(50, 'Cálculo I;2024-2;30;32', 0, '', 0, 0, 0, 0, 0, 0, 0),
(51, 'Cálculo I;2025-1;35;33', 0, '', 0, 0, 0, 0, 0, 0, 0),
(52, 'Programación Básica;2024-1;25;22', 0, '', 0, 0, 0, 0, 0, 0, 0),
(53, 'Programación Básica;2024-2;25;27', 0, '', 0, 0, 0, 0, 0, 0, 0),
(54, 'Programación Básica;2025-1;30;29', 0, '', 0, 0, 0, 0, 0, 0, 0),
(55, 'Contabilidad General;2024-1;35;33', 0, '', 0, 0, 0, 0, 0, 0, 0),
(56, 'Contabilidad General;2024-2;35;36', 0, '', 0, 0, 0, 0, 0, 0, 0),
(57, 'Contabilidad General;2025-1;38;37', 0, '', 0, 0, 0, 0, 0, 0, 0),
(58, 'Fundamentos de Administración;2024-1;40;38', 0, '', 0, 0, 0, 0, 0, 0, 0),
(59, 'Fundamentos de Administración;2024-2;40;41', 0, '', 0, 0, 0, 0, 0, 0, 0),
(60, 'Fundamentos de Administración;2025-1;42;40', 0, '', 0, 0, 0, 0, 0, 0, 0),
(61, 'Cálculo I;2024-1;30;28', 0, '', 0, 0, 0, 0, 0, 0, 0),
(62, 'Cálculo I;2024-2;30;32', 0, '', 0, 0, 0, 0, 0, 0, 0),
(63, 'Cálculo I;2025-1;35;33', 0, '', 0, 0, 0, 0, 0, 0, 0),
(64, 'Programación Básica;2024-1;25;22', 0, '', 0, 0, 0, 0, 0, 0, 0),
(65, 'Programación Básica;2024-2;25;27', 0, '', 0, 0, 0, 0, 0, 0, 0),
(66, 'Programación Básica;2025-1;30;29', 0, '', 0, 0, 0, 0, 0, 0, 0),
(67, 'Contabilidad General;2024-1;35;33', 0, '', 0, 0, 0, 0, 0, 0, 0),
(68, 'Contabilidad General;2024-2;35;36', 0, '', 0, 0, 0, 0, 0, 0, 0),
(69, 'Contabilidad General;2025-1;38;37', 0, '', 0, 0, 0, 0, 0, 0, 0),
(70, 'Fundamentos de Administración;2024-1;40;38', 0, '', 0, 0, 0, 0, 0, 0, 0),
(71, 'Fundamentos de Administración;2024-2;40;41', 0, '', 0, 0, 0, 0, 0, 0, 0),
(72, 'Fundamentos de Administración;2025-1;42;40', 0, '', 0, 0, 0, 0, 0, 0, 0),
(73, 'Cálculo I;2024-1;30;28', 0, '', 0, 0, 0, 0, 0, 0, 0),
(74, 'Cálculo I;2024-2;30;32', 0, '', 0, 0, 0, 0, 0, 0, 0),
(75, 'Cálculo I;2025-1;35;33', 0, '', 0, 0, 0, 0, 0, 0, 0),
(76, 'Programación Básica;2024-1;25;22', 0, '', 0, 0, 0, 0, 0, 0, 0),
(77, 'Programación Básica;2024-2;25;27', 0, '', 0, 0, 0, 0, 0, 0, 0),
(78, 'Programación Básica;2025-1;30;29', 0, '', 0, 0, 0, 0, 0, 0, 0),
(79, 'Contabilidad General;2024-1;35;33', 0, '', 0, 0, 0, 0, 0, 0, 0),
(80, 'Contabilidad General;2024-2;35;36', 0, '', 0, 0, 0, 0, 0, 0, 0),
(81, 'Contabilidad General;2025-1;38;37', 0, '', 0, 0, 0, 0, 0, 0, 0),
(82, 'Fundamentos de Administración;2024-1;40;38', 0, '', 0, 0, 0, 0, 0, 0, 0),
(83, 'Fundamentos de Administración;2024-2;40;41', 0, '', 0, 0, 0, 0, 0, 0, 0),
(84, 'Fundamentos de Administración;2025-1;42;40', 0, '', 0, 0, 0, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reset_tokens`
--

CREATE TABLE `reset_tokens` (
  `id` int(11) NOT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `token` varchar(100) DEFAULT NULL,
  `fecha_expira` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) DEFAULT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `rol` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `correo`, `password`, `rol`) VALUES
(1, 'Admin', 'admin@polijic.edu', '1234', 'admin');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `asignaturas`
--
ALTER TABLE `asignaturas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `aulas`
--
ALTER TABLE `aulas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `cupos_estimados`
--
ALTER TABLE `cupos_estimados`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `historial_cambios`
--
ALTER TABLE `historial_cambios`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `indicadores_historicos`
--
ALTER TABLE `indicadores_historicos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `matriculas_historicas`
--
ALTER TABLE `matriculas_historicas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `reset_tokens`
--
ALTER TABLE `reset_tokens`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `asignaturas`
--
ALTER TABLE `asignaturas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `aulas`
--
ALTER TABLE `aulas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `cupos_estimados`
--
ALTER TABLE `cupos_estimados`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `historial_cambios`
--
ALTER TABLE `historial_cambios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `indicadores_historicos`
--
ALTER TABLE `indicadores_historicos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `matriculas_historicas`
--
ALTER TABLE `matriculas_historicas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=85;

--
-- AUTO_INCREMENT de la tabla `reset_tokens`
--
ALTER TABLE `reset_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
