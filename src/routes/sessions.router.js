import express from 'express';
import passport from 'passport';
import { registrarUsuario, iniciarSesion, autenticarGitHub, callbackGitHub, restaurarContraseña, obtenerUsuarioActual, cerrarSesion } from '../controllers/sessions.controller.js';

const router = express.Router();

router.post('/register', registrarUsuario);
router.post('/login', iniciarSesion);
router.get('/github', autenticarGitHub);
router.get('/githubcallback', callbackGitHub);
router.post('/restore', restaurarContraseña);
router.get('/current', passport.authenticate('current', { session: false }), obtenerUsuarioActual);
router.post('/logout', passport.authenticate('current', { session: false }), cerrarSesion);

export default router;
