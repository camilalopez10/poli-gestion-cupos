// controllers/cupoEstimadoController.js
import { db } from "../database/db.js";

// Obtener todos los cupos estimados (opcional: ?codigo_asignatura=...)
export const getCuposEstimados = async (req, res) => {
  try {
    if (req.query.codigo_asignatura) {
      const [rows] = await db.query(
        "SELECT * FROM cupos_estimados WHERE codigo_asignatura = ?",
        [req.query.codigo_asignatura]
      );
      return res.json(rows);
    }

    const [rows] = await db.query("SELECT * FROM cupos_estimados");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// Obtener un cupo estimado por ID
export const getCupoEstimado = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM cupos_estimados WHERE id = ?", [req.params.id]);
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

// Crear un cupo estimado
export const createCupoEstimado = async (req, res) => {
  try {
    const { codigo_asignatura, anio, periodo, cupos_calculados, fecha } = req.body;

    if (!codigo_asignatura || anio === undefined || periodo === undefined || cupos_calculados === undefined) {
      return res.status(400).json({ message: "Los campos codigo_asignatura, anio, periodo y cupos_calculados son obligatorios" });
    }

    const anioInt = parseInt(anio, 10);
    const cuposInt = parseInt(cupos_calculados, 10);
    if (Number.isNaN(anioInt)) {
      return res.status(400).json({ message: "anio debe ser un número entero" });
    }
    if (Number.isNaN(cuposInt) || cuposInt < 0) {
      return res.status(400).json({ message: "cupos_calculados debe ser un número entero no negativo" });
    }

    // fecha es opcional; si se proporciona, validar formato ISO/parseable
    let fechaVal = null;
    if (fecha) {
      const d = new Date(fecha);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ message: "fecha no tiene un formato de fecha válido" });
      }
      fechaVal = d.toISOString().slice(0, 19).replace('T', ' '); // mysql DATETIME-like
    }

    const query = `INSERT INTO cupos_estimados (codigo_asignatura, anio, periodo, cupos_calculados, fecha) VALUES (?, ?, ?, ?, ?)`;
    const values = [codigo_asignatura, anioInt, periodo, cuposInt, fechaVal];

    const [result] = await db.query(query, values);

    res.status(201).json({
      message: "Cupo estimado creado exitosamente",
      registro: { id: result.insertId, codigo_asignatura, anio: anioInt, periodo, cupos_calculados: cuposInt, fecha: fechaVal },
    });
  } catch (error) {
    console.error("Error al crear cupo estimado:", error);
    res.status(500).json({ message: "Error al crear registro", error: error.message });
  }
};

// Actualizar un cupo estimado (updates parciales)
export const updateCupoEstimado = async (req, res) => {
  try {
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);

    if (keys.length === 0) {
      return res.status(400).json({ message: "No hay datos para actualizar" });
    }

    // validar campos numéricos y fecha si están presentes
    if (keys.includes('anio')) {
      const idx = keys.indexOf('anio');
      const n = parseInt(values[idx], 10);
      if (Number.isNaN(n)) return res.status(400).json({ message: 'anio debe ser un número entero' });
      values[idx] = n;
    }
    if (keys.includes('cupos_calculados')) {
      const idx = keys.indexOf('cupos_calculados');
      const n = parseInt(values[idx], 10);
      if (Number.isNaN(n) || n < 0) return res.status(400).json({ message: 'cupos_calculados debe ser entero no negativo' });
      values[idx] = n;
    }
    if (keys.includes('fecha')) {
      const idx = keys.indexOf('fecha');
      const d = new Date(values[idx]);
      if (isNaN(d.getTime())) return res.status(400).json({ message: 'fecha no válida' });
      values[idx] = d.toISOString().slice(0, 19).replace('T', ' ');
    }

    const setClause = keys.map((k) => `${k} = ?`).join(', ');
    values.push(req.params.id);

    const [result] = await db.query(`UPDATE cupos_estimados SET ${setClause} WHERE id = ?`, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No se encuentra registrado" });
    }

    res.json({ message: "Registro actualizado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar un cupo estimado
export const deleteCupoEstimado = async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM cupos_estimados WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No se encuentra registrado" });
    }

    res.json({ message: "Registro eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
