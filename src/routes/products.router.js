import ProductsController from '../controllers/products.controller.js';
import CustomRouter from './custom.router.js';

export default class ProductsRouter extends CustomRouter {
    static #instance;

    constructor() {
        super();
    }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new ProductsRouter();
        }
        return this.#instance;
    }

    init() {
        this.get('/', ['ALL'], ProductsController.getProducts);

        this.get('/:pid', ['ALL'], ProductsController.getProductById);

        this.post('/', ['PREMIUM', 'ADMIN'], this.validateProductFields, ProductsController.createProduct);

        this.put('/:pid', ['PREMIUM', 'ADMIN'], this.validateProductFields, ProductsController.updateProduct);

        this.delete('/:pid', ['PREMIUM', 'ADMIN'], produ.deleteProduct);
    }

    validateProductFields(req, res, next) {
        const { title, code, price } = req.body;
        if (!title || !code || !price) {
            req.logger.warning('Los campos título, código y precio son obligatorios');
            return res.sendUserError('Los campos título, código y precio son obligatorios');
        }
        if (isNaN(price) || price < 0) {
            req.logger.warning('El precio debe ser un número positivo');
            return res.sendUserError('El precio debe ser un número positivo');
        }
        next();
    }
}