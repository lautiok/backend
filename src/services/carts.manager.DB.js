import cartModel from '../dao/models/cart.model.js';
import  ProductsManagerDB  from '../dao/models/product.model.js';

export class CartsManagerDB {
    static #instance;

    constructor() { }

    // Método para obtener la instancia única de CartsManagerDB
    static getInstance() {
        if (!CartsManagerDB.#instance) {
            CartsManagerDB.#instance = new CartsManagerDB();
        }
        return CartsManagerDB.#instance;
    }

    // Método para obtener un carrito por su ID
    async getCartById(id) {
        try {
            if (id.length !== 24) {
                throw new Error('El id debe tener 24 caracteres');
            }
            const cart = await cartModel.findOne({ _id: id }).lean();
            if (!cart) {
                throw new Error(`No se encontró el carrito con id ${id}`);
            }
            return cart;
        } catch (error) {
            throw error;
        }
    }

    // Método para crear un nuevo carrito
    async createCart() {
        try {
            const cart = await cartModel.create({});
            if (!cart) {
                throw new Error('No se pudo crear el carrito');
            }
            return cart;
        } catch (error) {
            throw error;
        }
    }

    // Método para añadir un producto al carrito
    async addProduct(cartId, productId, quantity) {
        try {
            await ProductsManagerDB.getInstance().getProductById(productId);
            let cart = await this.getCartById(cartId);
            const productIndex = cart.products.findIndex(product => product.product._id.toString() === productId);
            if (productIndex !== -1) {
                cart.products[productIndex].quantity += quantity;
            } else {
                cart.products.push({ product: productId, quantity: quantity });
            }
            await cartModel.updateOne({ _id: cartId }, { products: cart.products });
            cart = await this.getCartById(cartId);
            return cart;
        } catch (error) {
            throw error;
        }
    }

    // Método para actualizar un carrito con nuevos productos
    async updateCart(id, products) {
        try {
            // Validar los productos antes de actualizar el carrito
            const promises = products.map(product => {
                return ProductsManagerDB.getInstance().getProductById(product.product)
                    .catch(error => {
                        throw new Error(error);
                    });
            });
            await Promise.all(promises);
            let cart = await this.getCartById(id);
            products.forEach(product => {
                const productIndex = cart.products.findIndex(cartProduct => cartProduct.product && cartProduct.product._id && cartProduct.product._id.toString() === product.product);
                if (productIndex !== -1) {
                    cart.products[productIndex].quantity = product.quantity;
                } else {
                    cart.products.push({ product: product.product, quantity: product.quantity });
                }
            });
            await cartModel.updateOne({ _id: id }, { products: cart.products });
            cart = await this.getCartById(id);
            return cart;
        } catch (error) {
            throw error;
        }
    }

    // Método para actualizar la cantidad de un producto en el carrito
    async updateProductQuantity(cartId, productId, quantity) {
        try {
            let cart = await this.getCartById(cartId);
            const productIndex = cart.products.findIndex(product => product.product._id.toString() === productId);
            if (productIndex === -1) {
                throw new Error(`No se encontró el producto con id ${productId} en el carrito con id ${cartId}`);
            } else {
                cart.products[productIndex].quantity = quantity;
            }
            await cartModel.updateOne({ _id: cartId }, { products: cart.products });
            cart = await this.getCartById(cartId);
            return cart;
        } catch (error) {
            throw error;
        }
    }

    // Método para eliminar un carrito
    async deleteCart(id) {
        try {
            let cart = await this.getCartById(id);
            await cartModel.updateOne({ _id: id }, { products: [] });
            cart = await this.getCartById(id);
            return cart;
        } catch (error) {
            throw error;
        }
    }

    // Método para eliminar un producto del carrito
    async removeProduct(cartId, productId) {
        try {
            let cart = await this.getCartById(cartId);
            const productIndex = cart.products.findIndex(product => product.product._id.toString() === productId);
            if (productIndex === -1) {
                throw new Error(`No se encontró el producto con id ${productId} en el carrito con id ${cartId}`);
            } else {
                cart.products.splice(productIndex, 1);
            }
            await cartModel.updateOne({ _id: cartId }, { products: cart.products });
            cart = await this.getCartById(cartId);
            return cart;
        } catch (error) {
            throw error;
        }
    }
}
