import express from 'express';
import passport from 'passport'; 
import { ProductsManagerDB } from '../dao/products.manager.DB.js';
import { CartsManagerDB } from '../dao/carts.manager.DB.js'; 

const router = express.Router(); 

// Middleware para redirigir a la página de productos si el usuario está autenticado
const redirectToProductsIfAuthenticated = (req, res, next) => {
    if (req.query && Object.keys(req.query).length > 0) {
        return next(); // Si la solicitud contiene datos en la consulta, continúa con el siguiente middleware
    }
    // Autenticación del usuario actual utilizando Passport
    passport.authenticate('current', { session: false }, (error, user, info) => {
        if (error) {
            return next(error); // Si hay un error en la autenticación, pasa al siguiente middleware de manejo de errores
        }
        if (user) {
            return res.redirect('/products'); // Si el usuario está autenticado, redirige a la página de productos
        }
        next(); // Si el usuario no está autenticado, continúa con el siguiente middleware
    })(req, res, next);
};

// Ruta para la página de inicio de sesión
router.get('/login', redirectToProductsIfAuthenticated, (req, res) => {
    res.render('login', {
        style: 'login.css',
        title: 'Login'
    });
});

// Ruta para la página de registro
router.get('/register', redirectToProductsIfAuthenticated, (req, res) => {
    res.render('register', {
        style: 'register.css',
        title: 'Registrar'
    });
});

// Ruta para la página de restauración de contraseña
router.get('/restore', redirectToProductsIfAuthenticated, (req, res) => {
    res.render('restore', {
        style: 'restore.css',
        title: 'Restaurar'
    });
});

// Ruta para la página de productos
router.get('/products',
    passport.authenticate('current', { session: false, failureRedirect: '/login' }),
    async (req, res) => {
        // Obtención del usuario autenticado
        const user = req.user.user;
        try {
            // Obtención de los productos desde la base de datos
            const products = await ProductsManagerDB.getInstance().getProducts(req);
            // Renderización de la página de productos con los datos obtenidos
            res.render('products', {
                style: 'products.css',
                user,
                products,
                title: 'Tienda'
            });
        } catch (error) {
            res.status(500).json({ error: error.message }); // Manejo de errores
        }
    }
);

// Ruta para la página de carritos
router.get('/carts/:cid',
    passport.authenticate('current', { session: false, failureRedirect: '/login' }),
    async (req, res) => {
        const { cid } = req.params;
        try {
            // Obtención del carrito por ID desde la base de datos
            const cart = await CartsManagerDB.getInstance().getCartById(cid);
            // Cálculo del total de la compra y actualización de los productos en el carrito
            cart.products = cart.products.map(product => {
                return {
                    ...product,
                    total: product.product.price * product.quantity
                };
            });
            cart.total = cart.products.reduce((acc, product) => acc + product.total, 0).toFixed(2);
            // Renderización de la página de carritos con los datos obtenidos
            res.render('carts', {
                style: 'carts.css',
                cart,
                title: 'Carrito'
            });
        } catch (error) {
            res.status(500).json({ error: error.message }); // Manejo de errores
        }
    }
);

// Ruta para la página de perfil
router.get('/profile',
    passport.authenticate('current', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        // Obtención del usuario autenticado
        const user = req.user.user;
        // Renderización de la página de perfil con los datos del usuario
        res.render('profile', {
            style: 'profile.css',
            user,
            title: 'Perfil'
        });
    }
);
// Ruta de redirección por defecto
router.get('*', (req, res, next) => {
    res.redirect('/login'); // Redirige cualquier URL no definida a la página de inicio de sesión
});

export default router; 
