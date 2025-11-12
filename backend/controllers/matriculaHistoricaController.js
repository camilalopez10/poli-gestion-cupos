// controllers/matriculaHistoricaController.js
import { db } from "../database/db.js";

// Obtener todas las matrículas históricas (opcional: filter por codigo_asignatura via ?codigo_asignatura=...)
export const getMatriculasHistoricas = async (req, res) => {
  try {
    if (req.query.codigo_asignatura) {
      const [rows] = await db.query(
        "SELECT * FROM matriculas_historicas WHERE codigo_asignatura = ?",
        [req.query.codigo_asignatura]
      );
      return res.json(rows);
    }

    const [rows] = await db.query("SELECT * FROM matriculas_historicas");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error interno del servidor", error: error.message });
  }
};

// Obtener una matrícula histórica por ID
export const getMatriculaHistorica = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM matriculas_historicas WHERE id = ?", [req.params.id]);
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

// Crear una matrícula histórica
export const createMatriculaHistorica = async (req, res) => {
  try {
    const {
      codigo_asignatura,
      anio,
      periodo,
      matriculados,
      aprobados,
      reprobados,
      cancelaciones,
      reingresos,
      transferencia_interna,
      transferencia_externa,
    } = req.body;

    // Campos obligatorios razonables: codigo_asignatura, anio, periodo, matriculados
    if (!codigo_asignatura || anio === undefined || periodo === undefined || matriculados === undefined) {
      return res.status(400).json({ message: "Los campos codigo_asignatura, anio, periodo y matriculados son obligatorios" });
    }

    const anioInt = parseInt(anio, 10);
    const matriculadosInt = parseInt(matriculados, 10);
    if (Number.isNaN(anioInt)) {
      return res.status(400).json({ message: "anio debe ser un número entero" });
    }
    if (Number.isNaN(matriculadosInt) || matriculadosInt < 0) {
      return res.status(400).json({ message: "matriculados debe ser un número entero no negativo" });
    }

    // Validar otros campos numéricos si se pasan
    const parseNonNeg = (v) => {
      if (v === undefined || v === null) return 0;
      const n = parseInt(v, 10);
      if (Number.isNaN(n) || n < 0) return null;
      return n;
    };

    const aprobadosInt = parseNonNeg(aprobados);
    const reprobadosInt = parseNonNeg(reprobados);
    const cancelacionesInt = parseNonNeg(cancelaciones);
    const reingresosInt = parseNonNeg(reingresos);
    const transferenciaInternaInt = parseNonNeg(transferencia_interna);
    const transferenciaExternaInt = parseNonNeg(transferencia_externa);

    if (
      aprobadosInt === null ||
      reprobadosInt === null ||
      cancelacionesInt === null ||
      reingresosInt === null ||
      transferenciaInternaInt === null ||
      transferenciaExternaInt === null
    ) {
      return res.status(400).json({ message: "Los campos numéricos deben ser enteros no negativos si se proporcionan" });
    }

    const query = `INSERT INTO matriculas_historicas
      (codigo_asignatura, anio, periodo, matriculados, aprobados, reprobados, cancelaciones, reingresos, transferencia_interna, transferencia_externa)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      codigo_asignatura,
      anioInt,
      periodo,
      matriculadosInt,
      aprobadosInt,
      reprobadosInt,
      cancelacionesInt,
      reingresosInt,
      transferenciaInternaInt,
      transferenciaExternaInt,
    ];

    const [result] = await db.query(query, values);

    res.status(201).json({
      message: "Matrícula histórica creada exitosamente",
      registro: { id: result.insertId, codigo_asignatura, anio: anioInt, periodo, matriculados: matriculadosInt },
    });
  } catch (error) {
    console.error("Error al crear matricula historica:", error);
    res.status(500).json({ message: "Error al crear registro", error: error.message });
  }
};

// Actualizar una matrícula histórica (updates parciales)
export const updateMatriculaHistorica = async (req, res) => {
  try {
    const keys = Object.keys(req.body);
    const values = Object.values(req.body);

    if (keys.length === 0) {
      return res.status(400).json({ message: "No hay datos para actualizar" });
    }

    // Validar campos numéricos si están presentes
    const numericFields = [
      'anio',
      'matriculados',
      'aprobados',
      'reprobados',
      'cancelaciones',
      'reingresos',
      'transferencia_interna',
      'transferencia_externa',
    ];

    for (const field of numericFields) {
      if (keys.includes(field)) {
        const idx = keys.indexOf(field);
        const n = parseInt(values[idx], 10);
        if (Number.isNaN(n) || n < 0) {
          return res.status(400).json({ message: `${field} debe ser un número entero no negativo` });
        }
        values[idx] = n;
      }
    }

    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    values.push(req.params.id);

    const [result] = await db.query(`UPDATE matriculas_historicas SET ${setClause} WHERE id = ?`, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No se encuentra registrado" });
    }

    res.json({ message: "Registro actualizado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Eliminar una matrícula histórica
export const deleteMatriculaHistorica = async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM matriculas_historicas WHERE id = ?", [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No se encuentra registrado" });
    }

    res.json({ message: "Registro eliminado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
