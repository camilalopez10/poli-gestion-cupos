// db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

export const db = mysql.createPool({
    host: process.env.DB_HOST || 'sql.freedb.tech',
    user: process.env.DB_USER || 'freedb_camila',
    password: process.env.DB_PASS || 'Rh6usWhP6yy$7W!',
    database: process.env.DB_NAME || 'freedb_poli_gestion',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export async function testConnection() {
    try {
        const [rows] = await db.query('SELECT NOW() AS now');
        console.log("✅ Conexión exitosa a la base de datos MySQL. Hora actual:", rows[0].now);
    } catch (error) {
        console.error("❌ Error al conectar a la base de datos MySQL:", error);
    }
}
