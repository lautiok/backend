import productModel from '../dao/models/product.model.js';

export class ProductsManagerDB {
    static #instance;

    constructor() { }

    // Método para obtener la instancia única de ProductsManagerDB
    static getInstance() {
        if (!ProductsManagerDB.#instance) {
            ProductsManagerDB.#instance = new ProductsManagerDB();
        }
        return ProductsManagerDB.#instance;
    }
    // Método para obtener todos los productos
    async getProducts(req) {
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const page = req.query.page ? parseInt(req.query.page) : 1;
        const status = req.query.status ? req.query.status : null;
        const category = req.query.category ? req.query.category.charAt(0).toUpperCase() + req.query.category.slice(1) : null;
        let sort = parseInt(req.query.sort);
        if (limit > 10) {
            limit = 10;
        }
        const filter = {};
        if (status) {
            filter.status = status;
        }
        if (category) {
            filter.category = category;
        }
        if (sort === 1 || sort === -1) {
            sort = { price: sort };
        } else {
            sort = null;
        }
        try {
            const products = await productModel.paginate(filter, { limit, page, sort, lean: true });
            if (page > products.totalPages || page <= 0 || isNaN(page)) {
                throw new Error('Página inexistente');
            }
            products.prevLink = products.page > 1 ? `/products?page=${products.page - 1}` : null;
            products.nextLink = products.page < products.totalPages ? `/products?page=${products.page + 1}` : null;
            return products;
        } catch (error) {
            throw error;
        }
    }
    // Método para obtener un producto por su ID
    async getProductById(id) {
        try {
            if (id.length !== 24) {
                throw new Error('El id debe tener 24 caracteres');
            }
            const product = await productModel.findOne({ _id: id });
            if (!product) {
                throw new Error(`No se encontró el producto con id ${id}`);
            }
            return product;
        } catch (error) {
            throw error;
        }
    }
    // Método para crear un nuevo producto
    async createProduct(product) {
        try {
            const newProduct = await productModel.create(product);
            if (!newProduct) {
                throw new Error('No se pudo crear el producto');
            }
            return newProduct;
        } catch (error) {
            if (error.code === 11000) {
                throw new Error(`Ya existe un producto con el código ${product.code}`);
            }
            throw error;
        }
    }
    // Método para actualizar un producto
    async updateProduct(id, product) {
        try {
            let updatedProduct = await this.getProductById(id);
            await productModel.updateOne({ _id: id }, product);
            updatedProduct = await this.getProductById(id);
            return updatedProduct;
        } catch (error) {
            if (error.code === 11000) {
                throw new Error(`Ya existe un producto con el código ${product.code}`);
            }
            throw error;
        }
    }
    // Método para eliminar un producto
    async deleteProduct(id) {
        try {
            let deletedProduct = await this.getProductById(id);
            await productModel.deleteOne({ _id: id });
            return deletedProduct;
        } catch (error) {
            throw error;
        }
    }
}