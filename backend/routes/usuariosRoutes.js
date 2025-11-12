import {Router} from 'express';
import {
    getUsuarios,
    getUsuario,
    createUsuario,
    deleteUsuario,
    updateUsuario,
    loginUsuario
} from '../controllers/usuarioController.js';

const usuarioRouter = Router ();

usuarioRouter.get('/api/getUsuarios', getUsuarios);
usuarioRouter.get('/api/getUsuario/:id', getUsuario);
usuarioRouter.post('/api/createUsuario', createUsuario);
usuarioRouter.delete('/api/deleteUsuario/:id', deleteUsuario);
usuarioRouter.put('/api/updateUsuario/:id', updateUsuario);
usuarioRouter.post('/api/loginUsuario', loginUsuario);

export default usuarioRouter;