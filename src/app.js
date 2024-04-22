import { program } from 'commander';
import initializePersistence from './dao/factory.js';
import express from 'express';
import { __dirname } from './utils.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import handlebars from 'express-handlebars';
import passport from 'passport';
import initializePassport from './config/passport.config.js';
import ProductsRouter from './routes/products.router.js';
import CartsRouter from './routes/carts.router.js';
import SessionsRouter from './routes/sessions.router.js';
import ViewsRouter from './routes/views.router.js';
import initializeSocket from './config/socket.config.js';
import {errorHandler} from './middlewares/errs/index.js';

program.option('-p, --persistence <type>', 'mongo o fs', 'mongo').parse();
if (!program.opts().persistence) {
    console.log('El parámetro --persistence es obligatorio y debe ser mongo o fs');
    process.exit(1);
}
initializePersistence(program.opts().persistence);

const app = express();
dotenv.config();
const PORT = process.env.PORT || 8080;

app.use(errorHandler);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(cors(
    {
        credentials: true,
        origin: process.env.FRONTEND_URL
    }
));

app.engine('handlebars', handlebars.engine());
app.set('views', `${__dirname}/views`);
app.set('view engine', 'handlebars');

initializePassport();
app.use(passport.initialize());

app.use('/api/products', ProductsRouter.getInstance().getRouter());
app.use('/api/carts', CartsRouter.getInstance().getRouter());
app.use('/api/sessions', SessionsRouter.getInstance().getRouter());
app.use('/', ViewsRouter.getInstance().getRouter());

const httpServer = app.listen(PORT, () => console.log(`Servidor escuchando en el puerto ${PORT}`));

initializeSocket(httpServer);