import { Router } from 'express';
import {
  getAulas,
  getAula,
  createAula,
  updateAula,
  deleteAula,
} from '../controllers/aulaController.js';

const aulasRouter = Router();

aulasRouter.get('/api/getAulas', getAulas);
aulasRouter.get('/api/getAula/:id', getAula);
aulasRouter.post('/api/createAula', createAula);
aulasRouter.put('/api/updateAula/:id', updateAula);
aulasRouter.delete('/api/deleteAula/:id', deleteAula);

export default aulasRouter;
