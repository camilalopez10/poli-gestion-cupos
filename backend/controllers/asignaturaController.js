// controllers/asignaturaController.js
import { db } from "../database/db.js";

// Obtener todas las asignaturas
export const getAsignaturas = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM asignaturas");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// Obtener una asignatura por ID
export const getAsignatura = async (req, res) => {
    console.log("Fetching asignatura with codigo:", req.params.codigo);
  try {
    const [rows] = await db.query("SELECT * FROM asignaturas WHERE codigo = ?", [req.params.codigo]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "No existen registros" });
    }
    console.log("Asignatura found:", rows[0]);
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};

// Crear una asignatura
export const createAsignatura = async (req, res) => {
  try {
    const { codigo, nombre, creditos } = req.body;

    if (!codigo || !nombre || creditos === undefined || creditos === null) {
      return res.status(400).json({ message: "Los campos codigo, nombre y creditos son obligatorios" });
    }

    const creds = parseInt(creditos, 10);
    if (Number.isNaN(creds) || creds < 0) {
      return res.status(400).json({ message: "creditos debe ser un número entero no negativo" });
    }

    const query = "INSERT INTO asignaturas (codigo, nombre, creditos) VALUES (?, ?, ?)";
    const values = [codigo, nombre, creds];

    const [result] = await db.query(query, values);

    res.status(201).json({
      message: "Asignatura creada exitosamente",
      asignatura: { id: result.insertId, codigo, nombre, creditos: creds },
    });
  } catch (error) {
    console.error("Error al crear asignatura:", error);
    res.status(500).json({ message: "Error al crear asignatura", error: error.message });
  }
};

// Actualizar una asignatura (soporta updates parciales)
export const updateAsignatura = async (req, res) => {
  try {
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);

    if (keys.length === 0) {
      return res.status(400).json({ message: "No hay datos para actualizar" });
    }

    if (keys.includes("creditos")) {
      const idx = keys.indexOf("creditos");
      const creds = parseInt(values[idx], 10);
      if (Number.isNaN(creds) || creds < 0) {
        return res.status(400).json({ message: "creditos debe ser un número entero no negativo" });
      }
      values[idx] = creds;
    }

    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    values.push(req.params.id);

    const [result] = await db.query(`UPDATE asignaturas SET ${setClause} WHERE id = ?`, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No se encuentra registrado" });
    }

    res.json({ message: "Asignatura actualizada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar una asignatura
export const deleteAsignatura = async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM asignaturas WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No se encuentra registrado" });
    }

    res.json({ message: "Registro eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
