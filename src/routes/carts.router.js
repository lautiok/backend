import CustomRouter from './custom.router.js';
import CartsController from '../controllers/carts.controller.js';

export default class CartsRouter extends CustomRouter {
    static #instance;

    constructor() {
        super();
    }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new CartsRouter();
        }
        return this.#instance;
    }

    init() {
        this.post('/', ['PUBLIC'], CartsController.getInstance().createCart);

        this.get('/:cid', ['USER'], CartsController.getInstance().getCartById);

        this.post('/:cid/products/:pid', ['USER'], this.validateQuantity, CartsController.getInstance().addProduct);

        this.put('/:cid/products/:pid', ['USER'], this.validateQuantity, CartsController.getInstance().updateProductQuantity);

        this.delete('/:cid/products/:pid', ['USER'], CartsController.getInstance().removeProduct);

        this.delete('/:cid', ['USER'], CartsController.getInstance().deleteCart);

        this.post('/:cid/purchase', ['USER'], CartsController.getInstance().purchaseCart);
    }

    validateQuantity(req, res, next) {
        req.quantity = req.body.quantity ? (parseInt(req.body.quantity) < 1 || isNaN(parseInt(req.body.quantity)) ? 1 : parseInt(req.body.quantity)) : 1;
        next();
    }
}