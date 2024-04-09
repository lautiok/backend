import express from 'express';
import cookieParser from 'cookie-parser';
import handlebars from 'express-handlebars';
import passport from 'passport';
import mongoose from 'mongoose';
import { __dirname } from './utils.js';
import initializePassport from './config/passport.config.js';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import sessionsRouter from './routes/sessions.router.js';
import viewsRouter from './routes/views.router.js';
import dotenv from 'dotenv';

const PORT = 8080;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));
app.use(cookieParser('mySecret'));

app.engine('handlebars', handlebars.engine());
app.set('views', `${__dirname}/views`);
app.set('view engine', 'handlebars');

initializePassport();
app.use(passport.initialize());

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/', viewsRouter);

const httpServer = app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

dotenv.config();

mongoose.connect(process.env.MONGO_URI,)
    .then(() => console.log('Database connected'))
    .catch(error => console.log(`Database connection error: ${error}`))