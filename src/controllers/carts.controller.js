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
            req.logger.info('Carrito creado con éxito');
            res.sendSuccessPayload(payload);
        } catch (error) {
            req.logger.error(`Error al crear carrito: ${error.message}`);
            res.sendServerError(error.message);
        }
    }

    async getCartById(req, res) {
        try {
            const { cid } = req.params;
            const payload = await CartsRepository.getInstance().getCartById(cid);
            if (!payload) {
                req.logger.warn(`No existe un carrito con el id ${cid}`);
                return res.sendUserError(`No existe un carrito con el id ${cid}`);
            }
            req.logger.info(`Consulta de carrito ID ${cid} exitosa`);
            res.sendSuccessPayload(payload);
        } catch (error) {
            req.logger.error(`Error al consultar carrito ID ${cid}: ${error.message}`);
            res.sendServerError(error.message);
        }
    }

    async addProduct(req, res) {
        try {
            const { cid, pid } = req.params;
            const quantity = req.body.quantity;
            const cart = await CartsRepository.getInstance().getCartById(cid);
            if (!cart) {
                req.logger.warn(`No existe un carrito con el id ${cid}`);
                return res.sendUserError(`No existe un carrito con el id ${cid}`);
            }
            const product = await ProductsRepository.getInstance().getProductById(pid);
            if (!product) {
                req.logger.warn(`No existe un producto con el id ${pid}`);
                return res.sendUserError(`No existe un producto con el id ${pid}`);
            }
            const payload = await CartsRepository.getInstance().addProduct(cart, product, quantity);
            req.logger.info(`Producto ID ${pid} agregado al carrito ID ${cid} existosamente`);
            res.sendSuccessPayload(payload);
        } catch (error) {
            req.logger.error(`Error al agregar producto ID ${pid} al carrito ID ${cid}: ${error.message}`);
            res.sendServerError(error.message);
        }
    }

    async updateProductQuantity(req, res) {
        try {
            const { cid, pid } = req.params;
            const quantity = req.body.quantity;
            const cart = await CartsRepository.getInstance().getCartById(cid);
            if (!cart) {
                req.logger.warn(`No existe un carrito con el id ${cid}`);
                return res.sendUserError(`No existe un carrito con el id ${cid}`);
            }
            const product = await ProductsRepository.getInstance().getProductById(pid);
            if (!product) {
                req.logger.warn(`No existe un producto con el id ${pid}`);
                return res.sendUserError(`No existe un producto con el id ${pid}`);
            }
            const payload = await CartsRepository.getInstance().updateProductQuantity(cart, product, quantity);
            if (!payload) {
                req.logger.warn(`No se encontro el producto con id ${pid} en el carrito con id ${cid}`);
                return res.sendUserError(`No se encontro el producto con id ${pid} en el carrito con id ${cid}`);
            }
            req.logger.info(`Cantidad del producto ID ${pid} en el carrito ID ${cid} actualizada a ${quantity}`);
            res.sendSuccessPayload(payload);
        } catch (error) {
            req.logger.error(`Error al actualizar cantidad del producto ID ${pid} en el carrito ID ${cid}: ${error.message}`);
            res.sendServerError(error.message);
        }
    }

    async removeProduct(req, res) {
        try {
            const { cid, pid } = req.params;
            const cart = await CartsRepository.getInstance().getCartById(cid);
            if (!cart) {
                req.logger.warn(`No existe un carrito con el id ${cid}`);
                return res.sendUserError(`No existe un carrito con el id ${cid}`);
            }
            const product = await ProductsRepository.getInstance().getProductById(pid);
            if (!product) {
                req.logger.warn(`No existe un producto con el id ${pid}`);
                return res.sendUserError(`No existe un producto con el id ${pid}`);
            }
            const payload = await CartsRepository.getInstance().removeProduct(cart, product);
            if (!payload) {
                req.logger.warn(`No se encontro el producto con id ${pid} en el carrito con id ${cid}`);
                return res.sendUserError(`No se encontro el producto con id ${pid} en el carrito con id ${cid}`);
            }
            res.sendSuccessPayload(payload);
        } catch (error) {
            req.logger.error(`Error al eliminar producto ID ${pid} del carrito ID ${cid}: ${error.message}`);
            res.sendServerError(error.message);
        }
    }

    async deleteCart(req, res) {
        try {
            const { cid } = req.params;
            const cart = await CartsRepository.getInstance().getCartById(cid);
            if (!cart) {
                req.logger.warn(`No existe un carrito con el id ${cid}`);
                return res.sendUserError(`No existe un carrito con el id ${cid}`);
            }
            const payload = await CartsRepository.getInstance().deleteCart(cid);
            req.logger.info(`Carrito ID ${cid} vaciado con éxito`);
            res.sendSuccessPayload(payload);
        } catch (error) {
            req.logger.error(`Error al vaciado carrito ID ${cid}: ${error.message}`);
            res.sendServerError(error.message);
        }
    }

    async purchaseCart(req, res) {
        try {
            const { cid } = req.params;
            const user = req.user;
            const cart = await CartsRepository.getInstance().getCartById(cid);
            if (!cart) {
                req.logger.warn(`No existe un carrito con el id ${cid}`);
                return res.sendUserError(`No existe un carrito con el id ${cid}`);
            }
            const payload = await CartsRepository.getInstance().purchaseCart(cart, user);
            if (payload.productsNotPurchased && !payload.ticket) {
                req.logger.warn('No se pudo realizar la compra porque no hay stock suficiente de los productos del carrito');
                return res.sendUserError('No se pudo realizar la compra porque no hay stock suficiente de los productos del carrito');
            }
            req.logger.info(`Compra del carrito ID ${cid} realizada con éxito`);
            res.sendSuccessPayload(payload);
        } catch (error) {
            req.logger.error(`Error al realizar compra del carrito ID ${cid}: ${error.message}`);
            res.sendServerError(error.message);
        }
    }
}