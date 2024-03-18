import express from 'express';
import passport from 'passport';

// Importar el modelo de usuario y la función para crear hash
import userModel from '../dao/models/user.model.js';
import { createHash } from '../utils.js';

// Crear un enrutador de Express
const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post('/register', passport.authenticate('register', { failureRedirect: '/api/sessions/fail' }),
    async (req, res) => res.redirect('/login'));

// Ruta para iniciar sesión
router.post('/login', passport.authenticate('login', { failureRedirect: '/api/sessions/fail' }),
    async (req, res) => {
        const { user } = req;
        if (user) {
            // Si se ha iniciado sesión correctamente, almacenar los datos del usuario en la sesión
            req.session.user = {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                age: user.age,
                role: 'user'
            };
            res.redirect('/products');
        }
    }
);

// Ruta para autenticación con GitHub
router.get('/github',
    passport.authenticate('github', { scope: ['user:email'] }), async (req, res) => { }
);

// Ruta de retorno de autenticación con GitHub
router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/api/sessions/fail' }),
    async (req, res) => {
        const { user } = req;
        if (user) {
            // Almacenar los datos del usuario en la sesión después de la autenticación con GitHub
            req.session.user = {
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                age: user.age,
                role: 'user'
            };
            res.redirect('/products');
        }
    }
);

// Ruta para manejar errores de autenticación
router.get('/fail', (req, res) => {
    // Obtener el mensaje de error de la sesión flash
    const errorMessage = req.flash('error')[0];
    res.status(401).json({ error: errorMessage });
});

// Ruta para restablecer la contraseña de un usuario
router.post('/restore', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Usuario inexistente' });
        }
        // Restablecer la contraseña y guardar el usuario actualizado
        user.password = createHash(password);
        await user.save();
        res.redirect('/login');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para cerrar sesión
router.post('/logout', (req, res) => {
    // Destruir la sesión y redirigir al usuario a la página de inicio de sesión
    req.session.destroy();
    res.redirect('/login');
});

// Exportar el enrutador
export default router;
