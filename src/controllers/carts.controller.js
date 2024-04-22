import CartsRepository from '../repositories/carts.repository.js';
import ProductsRepository from '../repositories/products.repository.js';

export default class CartsController {
    static #instance;

    constructor() { }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new CartsController();
        }
        return this.#instance;
    }

    async createCart(req, res) {
        try {
            const payload = await CartsRepository.getInstance().createCart();
            res.sendSuccessPayload(payload);
        } catch (error) {
            console.log(error);
            res.sendServerError(error.message);
        }
    }

    async getCartById(req, res) {
        try {
            const { cid } = req.params;
            const payload = await CartsRepository.getInstance().getCartById(cid);
            if (!payload) {
                return res.sendUserError(`No existe un carrito con el id ${cid}`);
            }
            res.sendSuccessPayload(payload);
        } catch (error) {
            console.log(error);
            res.sendServerError(error.message);
        }
    }

    async addProduct(req, res) {
        try {
            const { cid, pid } = req.params;
            const quantity = req.body.quantity;
            const cart = await CartsRepository.getInstance().getCartById(cid);
            if (!cart) {
                return res.sendUserError(`No existe un carrito con el id ${cid}`);
            }
            const product = await ProductsRepository.getInstance().getProductById(pid);
            if (!product) {
                return res.sendUserError(`No existe un producto con el id ${pid}`);
            }
            const payload = await CartsRepository.getInstance().addProduct(cart, product, quantity);
            res.sendSuccessPayload(payload);
        } catch (error) {
            console.log(error);
            res.sendServerError(error.message);
        }
    }

    async updateProductQuantity(req, res) {
        try {
            const { cid, pid } = req.params;
            const quantity = req.body.quantity;
            const cart = await CartsRepository.getInstance().getCartById(cid);
            if (!cart) {
                return res.sendUserError(`No existe un carrito con el id ${cid}`);
            }
            const product = await ProductsRepository.getInstance().getProductById(pid);
            if (!product) {
                return res.sendUserError(`No existe un producto con el id ${pid}`);
            }
            const payload = await CartsRepository.getInstance().updateProductQuantity(cart, product, quantity);
            if (!payload) {
                return res.sendUserError(`No se encontro el producto con id ${pid} en el carrito con id ${cid}`);
            }
            res.sendSuccessPayload(payload);
        } catch (error) {
            console.log(error);
            res.sendServerError(error.message);
        }
    }

    async removeProduct(req, res) {
        try {
            const { cid, pid } = req.params;
            const cart = await CartsRepository.getInstance().getCartById(cid);
            if (!cart) {
                return res.sendUserError(`No existe un carrito con el id ${cid}`);
            }
            const product = await ProductsRepository.getInstance().getProductById(pid);
            if (!product) {
                return res.sendUserError(`No existe un producto con el id ${pid}`);
            }
            const payload = await CartsRepository.getInstance().removeProduct(cart, product);
            if (!payload) {
                return res.sendUserError(`No se encontro el producto con id ${pid} en el carrito con id ${cid}`);
            }
            res.sendSuccessPayload(payload);
        } catch (error) {
            console.log(error);
            res.sendServerError(error.message);
        }
    }

    async deleteCart(req, res) {
        try {
            const { cid } = req.params;
            const cart = await CartsRepository.getInstance().getCartById(cid);
            if (!cart) {
                return res.sendUserError(`No existe un carrito con el id ${cid}`);
            }
            const payload = await CartsRepository.getInstance().deleteCart(cid);
            res.sendSuccessPayload(payload);
        } catch (error) {
            console.log(error);
            res.sendServerError(error.message);
        }
    }

    async purchaseCart(req, res) {
        try {
            const { cid } = req.params;
            const user = req.user;
            const cart = await CartsRepository.getInstance().getCartById(cid);
            if (!cart) {
                return res.sendUserError(`No existe un carrito con el id ${cid}`);
            }
            const payload = await CartsRepository.getInstance().purchaseCart(cart, user);
            if (payload.productsNotPurchased && !payload.ticket) {
                return res.sendUserError('No se pudo realizar la compra porque no hay stock suficiente de los productos del carrito');
            }
            res.sendSuccessPayload(payload);
        } catch (error) {
            console.log(error);
            res.sendServerError(error.message);
        }
    }
}