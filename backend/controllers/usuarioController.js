// controllers/usuariosController.js
import { db } from "../database/db.js";
import jwt from "jsonwebtoken";

// Obtener todos los usuarios
export const getUsuarios = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM usuarios");
    res.json(rows);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

// Obtener un usuario por ID
export const getUsuario = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "No existen registros" });
    }
    res.json(rows[0]);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};

// Crear un usuario
export const createUsuario = async (req, res) => {
  console.log("createUsuario called with body:", req.body);
  try {
    const data = req.body;

    if (!data.nombre || !data.correo || !data.password) {
      return res
        .status(400)
        .json({ message: "Los campos nombre, correo y password son obligatorios" });
    }

  // Nota: NO se encripta la contraseña (almacenamiento en texto plano según solicitud)
  // Guardamos la contraseña tal cual en `data.password`

    const query = "INSERT INTO usuarios (nombre, correo, password, rol) VALUES (?, ?, ?, ?)";
    const values = [data.nombre, data.correo, data.password, data.rol || "docente"];

    const [result] = await db.query(query, values);

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      usuario: { id: result.insertId, ...data },
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ message: "Error al registrar usuario", error: error.message });
  }
};

// Login de usuario
export const loginUsuario = async (req, res) => {
  console.log("loginUsuarioo called with body:", req.body);
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({ message: "Correo y contraseña son requeridos" });
    }

    const [rows] = await db.query("SELECT * FROM usuarios WHERE correo = ?", [correo]);
    console.log("Database query result:", rows);
    if (rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const usuario = rows[0];
    // Comparación en texto plano (no encriptado)
    if (usuario.password !== password) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Crear token JWT opcional
    //const token = jwt.sign({ id: usuario.id, rol: usuario.rol }, process.env.JWT_SECRET || "secret", {
    //  expiresIn: "8h",
    //});

    res.json({
      message: "Inicio de sesión exitoso",
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
      //token,
    });
  } catch (error) {
    console.error("Eerror en loginUsuario:", error);
    res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};

// Actualizar usuario
export const updateUsuario = async (req, res) => {
  try {
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);

    // No hasheamos la contraseña en las actualizaciones; se guarda tal cual si se proporciona

    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    values.push(req.params.id);

    const [result] = await db.query(`UPDATE usuarios SET ${setClause} WHERE id = ?`, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No se encuentra registrado" });
    }

    res.json({ message: "Datos actualizados exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar usuario
export const deleteUsuario = async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM usuarios WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No se encuentra registrado" });
    }

    res.json({ message: "Registro eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
