import express from 'express';
import { ProductsManagerDB } from '../dao/products.manager.DB.js';
import { CartsManagerDB } from '../dao/carts.manager.DB.js';

// Crear un enrutador de Express
const router = express.Router();

// Middleware para verificar la sesión del usuario
const checkSession = (req, res, next) => {
    if (!req.session.user && (req.originalUrl === '/register' || req.originalUrl === '/login' || req.originalUrl === '/restore')) {
        // Si no hay sesión de usuario y la URL es para registro, inicio de sesión o restablecimiento de contraseña, permitir el acceso
        next();
    } else if (req.session.user && (req.originalUrl === '/register' || req.originalUrl === '/login' || req.originalUrl === '/restore')) {
        // Si hay una sesión de usuario activa y la URL es para registro, inicio de sesión o restablecimiento de contraseña, redirigir al usuario a la página de productos
        res.redirect('/products');
    } else if (!req.session.user && (req.originalUrl === '/profile' || req.originalUrl === '/products' || req.originalUrl.startsWith('/carts/'))) {
        // Si no hay sesión de usuario y la URL es para el perfil, productos o carritos, redirigir al usuario a la página de inicio de sesión
        res.redirect('/login');
    } else {
        // En cualquier otro caso, continuar con la siguiente función de middleware
        next();
    }
};

// Aplicar el middleware de verificación de sesión a todas las rutas
router.use(checkSession);

// Ruta para redirigir a la página de inicio de sesión por defecto
router.get('/', (req, res) => {
    res.redirect('/login');
});

// Ruta para mostrar el formulario de inicio de sesión
router.get('/login', (req, res) => {
    res.render('login', {
        style: 'login.css',
        title: 'Login'
    });
});

// Ruta para mostrar el formulario de registro
router.get('/register', (req, res) => {
    res.render('register', {
        style: 'register.css',
        title: 'Register'
    });
});

// Ruta para mostrar el formulario de restablecimiento de contraseña
router.get('/restore', (req, res) => {
    res.render('restore', {
        style: 'restore.css',
        title: 'Restaurar contraseña'
    });
});

// Ruta para mostrar el perfil del usuario
router.get('/profile', (req, res) => {
    const user = req.session.user;
    res.render('profile', {
        style: 'profile.css',
        title: 'Profile',
        user
    });
});

// Ruta para mostrar la lista de productos
router.get('/products', async (req, res) => {
    const user = req.session.user;
    try {
        const products = await ProductsManagerDB.getInstance().getProducts(req);
        res.render('products', {
            style: 'products.css',
            user,
            title: 'Products',
            products
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ruta para mostrar el carrito de compras específico
router.get('/carts/:cid', async (req, res) => {
    const id = req.params.cid;
    try {
        const cart = await CartsManagerDB.getInstance().getCartById(id);
        // Calcular el total para cada producto y el total general del carrito
        cart.products = cart.products.map(product => {
            return {
                ...product,
                total: product.product.price * product.quantity
            };
        });
        cart.total = cart.products.reduce((acc, product) => acc + product.total, 0).toFixed(2);
        res.render('carts', {
            style: 'carts.css',
            cart,
            title: 'Carts'
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Exportar el enrutador
export default router;
