// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './database/db.js';
import usuarioRouter from './routes/usuariosRoutes.js';
import asignaturasRouter from './routes/asignaturasRoutes.js';
import aulasRouter from './routes/aulasRoutes.js';
import matriculasHistoricasRouter from './routes/matriculasHistoricasRoutes.js';
import cuposEstimadosRouter from './routes/cuposEstimadosRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());


app.use(usuarioRouter);
app.use(asignaturasRouter);
app.use(aulasRouter);
app.use(matriculasHistoricasRouter);
app.use(cuposEstimadosRouter);

// Rutas de ejemplo (agrega las tuyas)
app.get('/', (req, res) => {
    res.send('Servidor funcionando ✅');
});

// Inicia el servidor
app.listen(PORT, async () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
    // Probar la conexión a la DB cuando arranca el servidor
    await testConnection();
});
