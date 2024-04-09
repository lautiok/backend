import passport from 'passport';
import { generateToken } from '../utils.js';

export const registrarUsuario = (req, res, next) => {
    passport.authenticate('register', (error, user, info) => {
        if (error) {
            res.status(500).json({ status: 'error', message: error.message });
        } else if (!user) {
            res.status(401).json({ status: 'error', message: info });
        } else {
            res.status(201).json({ status: 'success', message: info });
        }
    })(req, res, next);
};

export const iniciarSesion = (req, res, next) => {
    passport.authenticate('login', (error, user, info) => {
        if (error) {
            res.status(500).json({ status: 'error', message: error.message });
        } else if (!user) {
            res.status(401).json({ status: 'error', message: info });
        } else {
            generateToken(res, user);
            res.status(200).json({ status: 'success', message: info });
        }
    })(req, res, next);
};

export const autenticarGitHub = passport.authenticate('github', { scope: ['user:email'] });

export const callbackGitHub = (req, res, next) => {
    passport.authenticate('github', (error, user, info) => {
        if (error) {
            return res.redirect(`/login?success=false&message=${error.message}`);
        } else if (!user) {
            return res.redirect(`/login?success=false&message=${info}`);
        } else {
            generateToken(res, user);
            return res.redirect(`/login?success=true&message=${info}`);
        }
    })(req, res, next);
};

export const restaurarContraseña = (req, res, next) => {
    passport.authenticate('restore', (error, user, info) => {
        if (error) {
            res.status(500).json({ status: 'error', message: error.message });
        } else if (!user) {
            res.status(401).json({ status: 'error', message: info });
        } else {
            res.status(201).json({ status: 'success', message: info });
        }
    })(req, res, next);
};

export const obtenerUsuarioActual = (req, res) => {
    res.status(200).json({ status: 'success', payload: req.user });
};

export const cerrarSesion = (req, res) => {
    res.clearCookie('token');
    res.redirect('/')
};
