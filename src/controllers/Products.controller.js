import ProductsRepository from '../repositories/products.repository.js';
import CustomError from '../services/errors/custom.error.js';
import { generateNewProductErrorInfo } from '../services/errors/info.js';
import EErrors from '../services/errors/enums.js';

export default class ProductsController {
    static #instance;

    constructor() { }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new ProductsController();
        }
        return this.#instance;
    }

    async getProducts(req, res) {
        try {
            const queryParams = req.query;
            const payload = await ProductsRepository.getInstance().getProducts(queryParams);
            req.logger.info('Consulta de productos exitosa');
            res.sendSuccessPayload(payload);
        } catch (error) {
            req.logger.error(`Error al consultar productos: ${error.message}`);
            res.sendServerError(error.message);
        }
    }

    async getProductById(req, res) {
        try {
            const { pid } = req.params;
            const payload = await ProductsRepository.getInstance().getProductById(pid);
            if (!payload) {
                req.logger.warn(`No existe un producto con el ID ${pid}`);
                return res.sendUserError(`No existe un producto con el id ${pid}`);
            }
            req.logger.info(`Consulta de producto ID ${pid} exitosa`);
            res.sendSuccessPayload(payload);
        } catch (error) {
            req.logger.error(`Error al consultar producto ID ${pid}: ${error.message}`);
            res.sendServerError(error.message);
        }
    }

    async createProduct(req, res) {
        try {
            const { title, code, price } = req.body;
            if (!title || !code || !price || isNaN(price) || price <= 0) {
                CustomError.createError({
                    name: 'Error de creación de producto',
                    cause: generateNewProductErrorInfo({ title, code, price }),
                    message: 'Error al intentar crear producto',
                    code: EErrors.VALIDATION_ERROR
                });
            }
            const newProduct = req.body;
            const product = await ProductsRepository.getInstance().getProductByCode(newProduct.code);
            if (product) {
                req.logger.warn(`Ya existe un producto con el código ${code}`);
                return res.sendUserError(`Ya existe un producto con el código ${newProduct.code}`);
            }
            const payload = await ProductsRepository.getInstance().createProduct(newProduct);
            req.logger.info(`Producto creado con éxito: ${JSON.stringify(payload)}`);
            res.sendSuccessPayload(payload);
        } catch (error) {
            req.logger.error(`Error al crear producto: ${error.message}`);
            if (error.code === 1) {
                return res.sendUserError(`${error.message}: ${error.cause}`);
            }
            res.sendServerError(error.message);
        }
    }

    async updateProduct(req, res) {
        try {
            const { pid } = req.params;
            const updatedProduct = req.body;
            let product = await ProductsRepository.getInstance().getProductById(pid);
            if (!product) {
                req.logger.warn(`No existe un producto con el ID ${pid}`)
                return res.sendUserError(`No existe un producto con el id ${pid}`);
            }
            if (updatedProduct.code !== product.code) {
                product = await ProductsRepository.getInstance().getProductByCode(updatedProduct.code);
                if (product) {
                    req.logger.warn(`Ya existe un producto con el código ${updatedProduct.code}`);
                    return res.sendUserError(`Ya existe un producto con el código ${updatedProduct.code}`);
                }
            }
            const payload = await ProductsRepository.getInstance().updateProduct(pid, updatedProduct);
            req.logger.info(`Producto ID ${pid} actualizado con éxito: ${JSON.stringify(payload)}`);
            res.sendSuccessPayload(payload);
        } catch (error) {
            req.logger.error(`Error al actualizar producto ID ${pid}: ${error.message}`);
            res.sendServerError(error.message);
        }
    }

    async deleteProduct(req, res) {
        try {
            const { pid } = req.params;
            const product = await ProductsRepository.getInstance().getProductById(pid);
            if (!product) {
                req.logger.warn(`No existe un producto con el ID ${pid}`);
                return res.sendUserError(`No existe un producto con el id ${pid}`);
            }
            const payload = await ProductsRepository.getInstance().deleteProduct(pid);
            req.logger.info(`Producto ID ${pid} eliminado con éxito: ${JSON.stringify(payload)}`);
            res.sendSuccessPayload(payload);
        } catch (error) {
            req.logger.error(`Error al eliminar producto ID ${pid}: ${error.message}`);
            res.sendServerError(error.message);
        }
    }
}