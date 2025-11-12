// controllers/aulaController.js
import { db } from "../database/db.js";

// Obtener todas las aulas
export const getAulas = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM aulas");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// Obtener un aula por ID
export const getAula = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM aulas WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "No existen registros" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};

// Crear un aula
export const createAula = async (req, res) => {
  try {
    const { nombre, capacidad, ubicacion, tipo } = req.body;

    if (!nombre || capacidad === undefined || capacidad === null || !ubicacion || !tipo) {
      return res.status(400).json({ message: "Los campos nombre, capacidad, ubicacion y tipo son obligatorios" });
    }

    const capInt = parseInt(capacidad, 10);
    if (Number.isNaN(capInt) || capInt < 0) {
      return res.status(400).json({ message: "capacidad debe ser un número entero no negativo" });
    }

    const query = "INSERT INTO aulas (nombre, capacidad, ubicacion, tipo) VALUES (?, ?, ?, ?)";
    const values = [nombre, capInt, ubicacion, tipo];

    const [result] = await db.query(query, values);

    res.status(201).json({
      message: "Aula creada exitosamente",
      aula: { id: result.insertId, nombre, capacidad: capInt, ubicacion, tipo },
    });
  } catch (error) {
    console.error("Error al crear aula:", error);
    res.status(500).json({ message: "Error al crear aula", error: error.message });
  }
};

// Actualizar un aula (soporta updates parciales)
export const updateAula = async (req, res) => {
  try {
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);

    if (keys.length === 0) {
      return res.status(400).json({ message: "No hay datos para actualizar" });
    }

    if (keys.includes("capacidad")) {
      const idx = keys.indexOf("capacidad");
      const capInt = parseInt(values[idx], 10);
      if (Number.isNaN(capInt) || capInt < 0) {
        return res.status(400).json({ message: "capacidad debe ser un número entero no negativo" });
      }
      values[idx] = capInt;
    }

    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    values.push(req.params.id);

    const [result] = await db.query(`UPDATE aulas SET ${setClause} WHERE id = ?`, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No se encuentra registrado" });
    }

    res.json({ message: "Aula actualizada exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar un aula
export const deleteAula = async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM aulas WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No se encuentra registrado" });
    }

    res.json({ message: "Registro eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
