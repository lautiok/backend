import ProductsRepository from '../repositories/products.repository.js';
import CustomError from '../service/errs/custom.error.js';
import { generateNewProductErrorInfo } from '../service/errs/info.js';
import EErrors from '../service/errs/enum.js';

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
            res.sendSuccessPayload(payload);
        } catch (error) {
            console.log(error);
            res.sendServerError(error.message);
        }
    }

    async getProductById(req, res) {
        try {
            const { pid } = req.params;
            const payload = await ProductsRepository.getInstance().getProductById(pid);
            if (!payload) {
                return res.sendUserError(`No existe un producto con el id ${pid}`);
            }
            res.sendSuccessPayload(payload);
        } catch (error) {
            console.log(error);
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
                return res.sendUserError(`Ya existe un producto con el código ${newProduct.code}`);
            }
            const payload = await ProductsRepository.getInstance().createProduct(newProduct);
            res.sendSuccessPayload(payload);
        } catch (error) {
            console.log(error);
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
                return res.sendUserError(`No existe un producto con el id ${pid}`);
            }
            if (updatedProduct.code !== product.code) {
                product = await ProductsRepository.getInstance().getProductByCode(updatedProduct.code);
                if (product) {
                    return res.sendUserError(`Ya existe un producto con el código ${updatedProduct.code}`);
                }
            }
            const payload = await ProductsRepository.getInstance().updateProduct(pid, updatedProduct);
            res.sendSuccessPayload(payload);
        } catch (error) {
            console.log(error);
            res.sendServerError(error.message);
        }
    }

    async deleteProduct(req, res) {
        try {
            const { pid } = req.params;
            const product = await ProductsRepository.getInstance().getProductById(pid);
            if (!product) {
                return res.sendUserError(`No existe un producto con el id ${pid}`);
            }
            const payload = await ProductsRepository.getInstance().deleteProduct(pid);
            res.sendSuccessPayload(payload);
        } catch (error) {
            console.log(error);
            res.sendServerError(error.message);
        }
    }
}