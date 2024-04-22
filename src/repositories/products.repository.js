import ProductDTO from '../dao/dtos/product.dto.js';
import { Products } from '../dao/factory.js';

export default class ProductsRepository {
    static #instance;

    constructor() { }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new ProductsRepository();
        }
        return this.#instance;
    }

    async getProducts(queryParams) {
        try {
            let { limit, page, status, category, sort } = queryParams;
            limit = limit ? (parseInt(limit) > 10 || parseInt(limit) < 1 || isNaN(parseInt(limit)) ? 10 : parseInt(limit)) : 10;
            page = page ? (parseInt(page) < 1 || isNaN(parseInt(page)) ? 1 : parseInt(page)) : 1;
            status = status && (status === 'true' || status === 'false') ? status === 'true' ? true : false : null;
            category = category || null;
            sort = sort && (parseInt(sort) === 1 || parseInt(sort) === -1) ? { price: parseInt(sort) } : null;
            let products = await Products.getInstance().getProducts({ limit, page, status, category, sort });
            if (page > products.totalPages) {
                page = products.totalPages;
                products = await Products.getInstance().getProducts({ limit, page, status, category, sort });
            }
            products.prevLink = products.prevPage ? `/products?page=${products.prevPage}` : null;
            products.nextLink = products.nextPage ? `/products?page=${products.nextPage}` : null;
            return products;
        } catch (error) {
            throw error;
        }
    }

    async getProductById(id) {
        try {
            return await Products.getInstance().getProductById(id);
        } catch (error) {
            throw error;
        }
    }

    async getProductByCode(code) {
        try {
            return await Products.getInstance().getProductByCode(code);
        } catch (error) {
            throw error;
        }
    }

    async createProduct(product) {
        try {
            const newProduct = new ProductDTO(product);
            return await Products.getInstance().createProduct(newProduct);
        } catch (error) {
            throw error;
        }
    }

    async updateProduct(id, product) {
        try {
            const updatedProduct = new ProductDTO(product);
            return await Products.getInstance().updateProduct(id, updatedProduct);
        } catch (error) {
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            return await Products.getInstance().deleteProduct(id);
        } catch (error) {
            throw error;
        }
    }
}