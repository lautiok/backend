import express from 'express'; 
import passport from 'passport'; 

import { generateToken } from '../utils.js';

const router = express.Router();

// Ruta para el registro de usuarios
router.post('/register', (req, res, next) => {
    passport.authenticate('register', (error, user, info) => { // Utiliza Passport para autenticar el registro
        if (error) {
            res.status(500).json({ status: 'error', message: error.message });
        } else if (!user) {
            res.status(401).json({ status: 'error', message: info });
        } else {
            res.status(201).json({ status: 'success', message: info });
        }
    })(req, res, next);
});

// Ruta para el inicio de sesión de usuarios
router.post('/login', (req, res, next) => {
    passport.authenticate('login', (error, user, info) => { // Utiliza Passport para autenticar el inicio de sesión
        if (error) {
            res.status(500).json({ status: 'error', message: error.message });
        } else if (!user) {
            res.status(401).json({ status: 'error', message: info });
        } else {
            generateToken(res, user); // Genera un token de autenticación para el usuario
            res.status(200).json({ status: 'success', message: info });
        }
    })(req, res, next);
});

// Ruta para la autenticación con GitHub
router.get('/github',
    passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => { }
);

// Ruta de callback para la autenticación con GitHub
router.get('/githubcallback', (req, res, next) => {
    passport.authenticate('github', (error, user, info) => { // Maneja el callback de autenticación de GitHub
        if (error) {
            return res.redirect(`/login?success=false&message=${error.message}`);
        } else if (!user) {
            return res.redirect(`/login?success=false&message=${info}`);
        } else {
            generateToken(res, user); // Genera un token de autenticación para el usuario
            return res.redirect(`/login?success=true&message=${info}`);
        }
    })(req, res, next);
});

// Ruta para restaurar contraseña
router.post('/restore', (req, res, next) => {
    passport.authenticate('restore', (error, user, info) => { // Utiliza Passport para autenticar la restauración de contraseña
        if (error) {
            res.status(500).json({ status: 'error', message: error.message });
        } else if (!user) {
            res.status(401).json({ status: 'error', message: info });
        } else {
            res.status(201).json({ status: 'success', message: info });
        }
    })(req, res, next);
});

// Ruta para obtener información del usuario actual
router.get('/current', passport.authenticate('current', { session: false }), (req, res) => {
    res.status(200).json({ status: 'success', payload: req.user });
});

// Ruta para cerrar sesión
router.post('/logout', passport.authenticate('current', { session: false }), (req, res) => {
    res.clearCookie('token'); // Borra la cookie de autenticación
    res.status(200).json({ status: 'success', message: 'Sesión cerrada con éxito' });
});

export default router; // Exporta el enrutador para su uso en otros archivos
