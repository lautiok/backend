import CustomRouter from './custom.router.js';
import productsController from '../controllers/products.controller.js';

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
        this.get('/', ['ALL'], productsController.getProducts);

        this.get('/:pid', ['ALL'], productsController.getProductById);

        this.post('/', ['PREMIUM', 'ADMIN'], this.validateProductFields, productsController.createProduct);

        this.put('/:pid', ['PREMIUM', 'ADMIN'], this.validateProductFields, productsController.updateProduct);

        this.delete('/:pid', ['PREMIUM', 'ADMIN'], productsController.deleteProduct);
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