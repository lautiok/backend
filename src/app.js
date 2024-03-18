import express from 'express'; 
import handlebars from 'express-handlebars'; 
import session from 'express-session';
import MongoStore from 'connect-mongo'; 
import databaseConfig from './config/config.bd.js'; 
import mongoose from 'mongoose'; 
import flash from 'connect-flash'; 
import passport from 'passport'; 
import { __dirname } from './utils.js'; 
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js'; 
import sessionsRouter from './routes/sessions.router.js';
import viewsRouter from './routes/views.router.js'; 
import initializePassport from './config/passport.config.js'; 

// Definir el número de puerto y crear el servidor express
const PORT = 8080;
const app = express();

// Middleware 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));

// Configurar el motor de plantillas Handlebars
app.engine('handlebars', handlebars.engine());
app.set('views', `${__dirname}/views`);
app.set('view engine', 'handlebars');

// Middleware para gestionar sesiones
app.use(session({
    store: MongoStore.create({
        mongoUrl: databaseConfig,
        ttl: 900 // Tiempo de vida de la sesión en segundos (15 minutos)
    }),
    secret: '62ac73b8d9f91071cb7d938ec4d0695c6afea72015a99605a1e342aece0a523f', 
    resave: false,
    saveUninitialized: false
}));

// Middleware para mensajes flash
app.use(flash());

// Inicializar Passport (middleware de autenticación)
initializePassport();
app.use(passport.initialize());
app.use(passport.session());

// Establecer rutas para diferentes recursos
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/', viewsRouter);

// Iniciar el servidor HTTP en el puerto especificado
const httpServer = app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));

// Conectar a la base de datos MongoDB
mongoose.connect(databaseConfig)
    .then(() => console.log('Base de datos conectada'))
    .catch(error => console.log('Error de conexión a la base de datos: ', error));
