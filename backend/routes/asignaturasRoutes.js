import { Router } from 'express';
import {
  getAsignaturas,
  getAsignatura,
  createAsignatura,
  updateAsignatura,
  deleteAsignatura,
} from '../controllers/asignaturaController.js';

const asignaturasRouter = Router();

asignaturasRouter.get('/api/getAsignaturas', getAsignaturas);
asignaturasRouter.get('/api/getAsignatura/:codigo', getAsignatura);
asignaturasRouter.post('/api/createAsignatura', createAsignatura);
asignaturasRouter.put('/api/updateAsignatura/:codigo', updateAsignatura);
asignaturasRouter.delete('/api/deleteAsignatura/:codigo', deleteAsignatura);

export default asignaturasRouter;
