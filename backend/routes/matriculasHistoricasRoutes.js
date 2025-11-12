import { Router } from 'express';
import {
  getMatriculasHistoricas,
  getMatriculaHistorica,
  createMatriculaHistorica,
  updateMatriculaHistorica,
  deleteMatriculaHistorica,
} from '../controllers/matriculaHistoricaController.js';

const matriculasHistoricasRouter = Router();

matriculasHistoricasRouter.get('/api/getMatriculasHistoricas', getMatriculasHistoricas);
matriculasHistoricasRouter.get('/api/getMatriculaHistorica/:id', getMatriculaHistorica);
matriculasHistoricasRouter.post('/api/createMatriculaHistorica', createMatriculaHistorica);
matriculasHistoricasRouter.put('/api/updateMatriculaHistorica/:id', updateMatriculaHistorica);
matriculasHistoricasRouter.delete('/api/deleteMatriculaHistorica/:id', deleteMatriculaHistorica);

export default matriculasHistoricasRouter;
