-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         12.2.2-MariaDB - MariaDB Server
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.14.0.7165
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para gestor-productos
CREATE DATABASE IF NOT EXISTS `gestor-productos` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `gestor-productos`;

-- Volcando estructura para tabla gestor-productos.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `antiguedad` varchar(255) DEFAULT NULL,
  `area` varchar(255) DEFAULT NULL,
  `nombre_completo` varchar(255) DEFAULT NULL,
  `nombre_supervisor` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `puesto` varchar(255) DEFAULT NULL,
  `rol` varchar(255) DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `apellido_materno` varchar(255) DEFAULT NULL,
  `apellido_paterno` varchar(255) DEFAULT NULL,
  `celular` varchar(255) DEFAULT NULL,
  `correo` varchar(255) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `dni` varchar(255) DEFAULT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKm2dvbwfge291euvmk6vkkocao` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla gestor-productos.usuarios: ~5 rows (aproximadamente)
INSERT INTO `usuarios` (`id`, `antiguedad`, `area`, `nombre_completo`, `nombre_supervisor`, `password`, `puesto`, `rol`, `username`, `apellido_materno`, `apellido_paterno`, `celular`, `correo`, `direccion`, `dni`, `nombre`) VALUES
	(1, NULL, 'Desarrollo de Sistemas', 'Crystian Peralta', 'Ing. Mario', '$2a$10$qYqUh8UMjfn3hKeUHB3ixOYwy2E19TqAjNtHHMrwJyE6f4z1858n6', NULL, 'ROLE_ADMIN', 'crystian.dev', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(2, NULL, 'Area de captura', 'Irving Lopez', 'David Jimenez', '$2a$10$qYqUh8UMjfn3hKeUHB3ixOYwy2E19TqAjNtHHMrwJyE6f4z1858n6', NULL, 'ROLE_USER', 'user.irving', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(3, NULL, 'Supervision', 'Javier Gomez', 'Julio Gutierrez', '$2a$10$qYqUh8UMjfn3hKeUHB3ixOYwy2E19TqAjNtHHMrwJyE6f4z1858n6', NULL, 'ROLE_GUEST', 'superv.adrian', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
	(4, NULL, NULL, 'test', NULL, '$2a$10$9Wl6pWWY4sFF439V.SfcueZkKPLBk8aLMPpAsQS7dppDSRPQ9HW/e', NULL, 'ROLE_USER', 'username', 'materno', 'paterno', '123456789', 'test12@gmail.com', 'direccion', NULL, 'nombre'),
	(5, NULL, NULL, 'nombreficticiotres paternoficiticiotres', NULL, '$2a$10$R95oc5qfsh8nH5L105gMsOyMTIenuEao4mNj9EpGEACUkVOFdDTQC', NULL, 'ROLE_USER', 'pruebatesttres', 'maternoficticiotres', 'paternoficiticiotres', '333333333', 'crystian.improving1@gmail.com', 'direccion ficticia tres', '33333333', 'nombreficticiotres'),
	(6, NULL, NULL, 'Crystian Peralta', NULL, '$2a$10$s20z6HJ.95zDaxXQmmT0suX6PwYczK1FhVIC2y6dBlC78FUn7qumC', NULL, 'ROLE_USER', 'testusuario', 'Granados', 'Peralta', '564654564', 'crystian.developments@gmail.com', 'direccion ficticia', '12345678', 'Crystian');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
