-- Backup recommended before running
CREATE TABLE IF NOT EXISTS usuarios_backup AS SELECT * FROM usuarios;
UPDATE usuarios SET rol = 'coordinador' WHERE rol = 'docente';
ALTER TABLE usuarios MODIFY COLUMN rol ENUM('admin','coordinador') DEFAULT 'coordinador';
