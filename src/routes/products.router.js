import CustomRouter from './custom.router.js';
import ProductsController from '../controllers/products.controller.js';

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
        this.get('/', ['USER', 'ADMIN'], ProductsController.getInstance().getProducts);

        this.get('/:pid', ['USER', 'ADMIN'], ProductsController.getInstance().getProductById);

        this.post('/', ['ADMIN'], this.validateProduct, ProductsController.getInstance().createProduct);

        this.put('/:pid', ['ADMIN'], this.validateProduct, ProductsController.getInstance().updateProduct);

        this.delete('/:pid', ['ADMIN'], ProductsController.getInstance().deleteProduct);
    }

    validateProduct(req, res, next) {
        const { title, code, price } = req.body;
        if (!title || !code || !price) {
            return res.sendUserError('Los campos título, código y precio son obligatorios');
        }
        if (isNaN(price) || price < 0) {
            return res.sendUserError('El precio debe ser un número positivo');
        }
        next();
    }
}