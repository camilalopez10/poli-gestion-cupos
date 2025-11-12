import { Router } from 'express';
import {
  getCuposEstimados,
  getCupoEstimado,
  createCupoEstimado,
  updateCupoEstimado,
  deleteCupoEstimado,
} from '../controllers/cupoEstimadoController.js';

const cuposEstimadosRouter = Router();

cuposEstimadosRouter.get('/api/getCuposEstimados', getCuposEstimados);
cuposEstimadosRouter.get('/api/getCupoEstimado/:id', getCupoEstimado);
cuposEstimadosRouter.post('/api/createCupoEstimado', createCupoEstimado);
cuposEstimadosRouter.put('/api/updateCupoEstimado/:id', updateCupoEstimado);
cuposEstimadosRouter.delete('/api/deleteCupoEstimado/:id', deleteCupoEstimado);

export default cuposEstimadosRouter;
