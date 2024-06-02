import { program } from 'commander';
import initializePersistence from './dao/factory.js';
import express from 'express';
import cors from 'cors';
import compression from 'express-compression';
import __dirname from './utils/dirname.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { addLogger } from './config/logger.config.js';
import handlebars from 'express-handlebars';
import passport from 'passport';
import initializePassport from './config/passport.config.js';
import ProductsRouter from './routes/products.router.js';
import CartsRouter from './routes/carts.router.js';
import SessionsRouter from './routes/sessions.router.js';
import swaggerSpecs from './config/doc.config.js';
import swaggerUi from 'swagger-ui-express';
import ViewsRouter from './routes/views.router.js';
import initializeSocket from './config/socket.config.js';

const environment = process.env.NODE_ENV || 'development';
dotenv.config({ path: environment === 'development' ? './.env.dev' : './.env.prod' });

program.option('-p, --persistence <type>', 'Tipo de persistencia (mongo o fs)').parse();
if (!program.opts().persistence) {
    console.log('El parámetro --persistence es obligatorio y debe ser mongo o fs');
    process.exit(1);
}
initializePersistence(program.opts().persistence);

const app = express();
const port = process.env.PORT ;


app.use(cors());
app.use(compression({ brotli: { enabled: true, zlib: {} } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(addLogger);

app.engine('handlebars', handlebars.engine());
app.set('views', `${__dirname}/views`);
app.set('view engine', 'handlebars');

initializePassport();
app.use(passport.initialize());

app.use('/api/products', ProductsRouter.getInstance().getRouter());
app.use('/api/carts', CartsRouter.getInstance().getRouter());
app.use('/api/sessions', SessionsRouter.getInstance().getRouter());

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/', ViewsRouter.getInstance().getRouter());

const httpServer = app.listen(port, () => console.log(`Servidor escuchando en el puerto ${port}`));

initializeSocket(httpServer);