import productModel from './models/product.model.js';

// Clase que gestiona los productos en la base de datos
export class ProductsManagerDB {
    static #instance;

    constructor() { }

    // Método estático para obtener una instancia única de la clase
    static getInstance() {
        if (!ProductsManagerDB.#instance) {
            ProductsManagerDB.#instance = new ProductsManagerDB();
        }
        return ProductsManagerDB.#instance;
    }

    // Obtiene una lista de productos filtrados y paginados
    async getProducts(req) {
        try {
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
            if(sort === 1 || sort === -1) {
                sort = { price: sort };
            } else {
                sort = null;
            }
            const products = await productModel.paginate(filter, { limit, page, sort, lean: true });
            if (page > products.totalPages || page <= 0 || isNaN(page)) {
                throw new Error('Página inexistente');
            }
            products.prevLink = products.page > 1 ? `/products?page=${products.page - 1}` : null;
            products.nextLink = products.page < products.totalPages ? `/products?page=${products.page + 1}` : null;
            return products;
        } catch (error) {
            console.error('Error en getProducts:', error);
            throw new Error('Ocurrió un error al obtener los productos');
        }
    }

    // Obtiene un producto por su ID
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
            console.error('Error en getProductById:', error);
            throw new Error('Ocurrió un error al obtener el producto');
        }
    }

    // Crea un nuevo producto
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
            console.error('Error en createProduct:', error);
            throw new Error('Ocurrió un error al crear el producto');
        }
    }

    // Actualiza un producto existente
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
            console.error('Error en updateProduct:', error);
            throw new Error('Ocurrió un error al actualizar el producto');
        }
    }

    // Elimina un producto por su ID
    async deleteProduct(id) {
        try {
            let deletedProduct = await this.getProductById(id);
            await productModel.deleteOne({ _id: id });
            return deletedProduct;
        } catch (error) {
            console.error('Error en deleteProduct:', error);
            throw new Error('Ocurrió un error al eliminar el producto');
        }
    }
}
