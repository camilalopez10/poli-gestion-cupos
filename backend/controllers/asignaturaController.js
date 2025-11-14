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
    const { codigo, nombre, creditos, nivel, prerequisito } = req.body;

    if (!codigo || !nombre || creditos === undefined || creditos === null) {
      return res.status(400).json({ message: "Los campos codigo, nombre y creditos son obligatorios" });
    }

    const creds = parseInt(creditos, 10);
    if (Number.isNaN(creds) || creds < 0) {
      return res.status(400).json({ message: "creditos debe ser un número entero no negativo" });
    }

  const query = "INSERT INTO asignaturas (codigo, nombre, creditos, nivel, prerequisito) VALUES (?, ?, ?, ?, ?)";
  const values = [codigo, nombre, creds, nivel ?? null, prerequisito ?? null];

    const [result] = await db.query(query, values);

    res.status(201).json({
      message: "Asignatura creada exitosamente",
      asignatura: { id: result.insertId, codigo, nombre, creditos: creds, nivel: nivel ?? null, prerequisito: prerequisito ?? null },
    });
  } catch (error) {
    console.error("Error al crear asignatura:", error);
    res.status(500).json({ message: "Error al crear asignatura", error: error.message });
  }
};

// Crear varias asignaturas en lote
export const createAsignaturas = async (req, res) => {
  console.log("createAsignaturas called with body:", req.body);
  try {
    const items = req.body.records;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Se requiere un arreglo de asignaturas" });
    }

    const errors = [];
    const values = [];

    items.forEach((it, idx) => {
      const { codigo, nombre, creditos, nivel, prerequisito } = it || {};
      if (!codigo || !nombre || creditos === undefined || creditos === null) {
        errors.push({ index: idx, message: 'codigo, nombre y creditos son obligatorios' });
        return;
      }
      var creds = parseInt(creditos, 10);
      if (Number.isNaN(creds)) {
        creds = 0;
      }
      if (creds < 0) {
        errors.push({ index: idx, message: 'creditos debe ser un entero no negativo' });
        return;
      }
      if (nivel !== undefined && nivel !== null && typeof nivel !== 'string') {
        errors.push({ index: idx, message: 'nivel debe ser una cadena si se proporciona' });
        return;
      }
      // if (prerequisito !== undefined && prerequisito !== null && typeof prerequisito !== 'string') {
      //   errors.push({ index: idx, message: 'prerequisito debe ser una cadena si se proporciona' });
      //   return;
      // }

      values.push([codigo, nombre, creds, nivel ?? null, prerequisito ?? null]);
    });

    if (errors.length > 0) {
      return res.status(400).json({ message: 'Errores en los datos de entrada', errors });
    }

    // Usar transacción para inserción en lote
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();
      const [result] = await conn.query(
        'INSERT INTO asignaturas (codigo, nombre, creditos, nivel, prerequisito) VALUES ?',
        [values]
      );
      await conn.commit();

      return res.status(201).json({
        message: 'Asignaturas creadas exitosamente',
        insertedCount: result.affectedRows,
        firstInsertId: result.insertId,
      });
    } catch (error) {
      await conn.rollback();
      console.error('Error al insertar asignaturas en lote:', error);
      if (error && error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Error: código duplicado', error: error.message });
      }
      return res.status(500).json({ message: 'Error al insertar asignaturas', error: error.message });
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
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
    // validar nivel y prerequisito si se envían
    if (keys.includes("nivel")) {
      const idx = keys.indexOf("nivel");
      if (values[idx] === null || values[idx] === undefined) {
        values[idx] = null;
      } else {
        values[idx] = String(values[idx]);
      }
    }
    if (keys.includes("prerequisito")) {
      const idx = keys.indexOf("prerequisito");
      if (values[idx] === null || values[idx] === undefined) {
        values[idx] = null;
      } else {
        values[idx] = String(values[idx]);
      }
    }

    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    values.push(req.params.codigo);

    const [result] = await db.query(`UPDATE asignaturas SET ${setClause} WHERE codigo = ?`, values);

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
    console.log("Deleting asignatura with codigo:", req.params.codigo);
  try {
    const [result] = await db.query("DELETE FROM asignaturas WHERE codigo = ?", [req.params.codigo]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No se encuentra registrado" });
    }

    res.json({ message: "Registro eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
