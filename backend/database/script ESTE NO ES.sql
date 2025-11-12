drop table if exists Usuario;
CREATE TABLE Usuario (
    id VARCHAR(50) PRIMARY KEY,
    primer_nombre VARCHAR(100),
    segundo_nombre VARCHAR(100),
    primer_apellido VARCHAR(100),
    segundo_apellido VARCHAR(100),
    email VARCHAR(255),
    telefono VARCHAR(20),
    fecha_nacimiento VARCHAR(20),
    contrasena VARCHAR(255),
    fecha_registro TIMESTAMP,
    foto_perfil VARCHAR(255),
    verificado BOOLEAN,
    tipo_usuario VARCHAR(50),
    categoria VARCHAR(100),
    ubicacion VARCHAR(100),
    descripcion TEXT,
    calificacion_promedio FLOAT,
    trabajos_completados INT
);
drop table if exists Categoria_trabajo;
CREATE TABLE Categoria_trabajo (
    id VARCHAR(50) PRIMARY KEY,
    nombre_cat VARCHAR(100),
    descripcion TEXT
);
drop table if exists Servicio;
CREATE TABLE Servicio (
    id VARCHAR(50) PRIMARY KEY,
    id_trabajador VARCHAR(50) REFERENCES Usuario(id),
    id_categoria VARCHAR(50) REFERENCES Categoria_trabajo(id),
    titulo VARCHAR(255),
    descripcion TEXT,
    precio FLOAT,
    estado VARCHAR(50),
    fecha_creacion TIMESTAMP
);
drop table if exists Publicacion;
CREATE TABLE Publicacion (
    id VARCHAR(50) PRIMARY KEY,
    id_cliente VARCHAR(50) REFERENCES Usuario(id),
    id_categoria VARCHAR(50) REFERENCES Categoria_trabajo(id),
    titulo VARCHAR(255),
    descripcion_necesidad TEXT,
    ubicacion VARCHAR(100),
    presupuesto FLOAT,
    fecha_publicacion TIMESTAMP,
    fecha_limite TIMESTAMP,
    estado VARCHAR(50),
    fotos VARCHAR(255)
);
drop table if exists Transaccion;
CREATE TABLE Transaccion (
    id VARCHAR(50) PRIMARY KEY,
    id_cliente VARCHAR(50) REFERENCES Usuario(id),
    id_trabajador VARCHAR(50) REFERENCES Usuario(id),
    monto FLOAT,
    comision_pasarela FLOAT,
    comision_app FLOAT,
    fecha_transaccion TIMESTAMP,
    estatus VARCHAR(50),
    metodo_pago VARCHAR(50),
    codigo_transaccion VARCHAR(100)
);
drop table if exists Calificacion_resena;
CREATE TABLE Calificacion_resena (
    id VARCHAR(50) PRIMARY KEY,
    id_trabajador VARCHAR(50) REFERENCES Usuario(id),
    calificacion INT,
    comentario TEXT,
    fecha_resena TIMESTAMP
);
drop table if exists Disputa;
CREATE TABLE Disputa (
    id VARCHAR(50) PRIMARY KEY,
    descripcion_disputa TEXT,
    estatus VARCHAR(50),
    fecha_creacion TIMESTAMP,
    fecha_resolucion TIMESTAMP,
    evidencia VARCHAR(255),
    id_publicacion VARCHAR(50) REFERENCES Publicacion(id),
    id_trabajador VARCHAR(50) REFERENCES Usuario(id)
);
drop table if exists Reporte;
CREATE TABLE Reporte (
    id VARCHAR(50) PRIMARY KEY,
    id_publicacion VARCHAR(50) REFERENCES Publicacion(id),
    razon VARCHAR(255)
);
drop table if exists Conversacion;
CREATE TABLE Conversacion (
    id VARCHAR(50) PRIMARY KEY,
    id_cliente VARCHAR(50) REFERENCES Usuario(id),
    id_trabajador VARCHAR(50) REFERENCES Usuario(id)
);
drop table if exists Mensaje;
CREATE TABLE Mensaje (
    id VARCHAR(50) PRIMARY KEY,
    id_sala_chat VARCHAR(50) REFERENCES Conversacion(id),
    id_remitente VARCHAR(50),
    fecha_envio TIMESTAMP,
    contenido VARCHAR(1000),
    estado VARCHAR(50)
);
