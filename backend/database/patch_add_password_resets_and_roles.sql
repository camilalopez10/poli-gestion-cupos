-- db/patch_add_password_resets_and_roles.sql
ALTER TABLE usuarios
  MODIFY COLUMN rol ENUM('admin','academico') NOT NULL DEFAULT 'academico';

CREATE TABLE IF NOT EXISTS password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  token VARCHAR(128) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX idx_password_resets_token ON password_resets(token);
