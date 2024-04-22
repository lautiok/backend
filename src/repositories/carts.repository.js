import { Carts } from '../dao/factory.js';
import ProductsRepository from '../repositories/products.repository.js';
import TicketsRepository from '../repositories/tickets.repository.js';

export default class CartsRepository {
    static #instance;

    constructor() { }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new CartsRepository();
        }
        return this.#instance;
    }

    async createCart() {
        try {
            return await Carts.getInstance().createCart();
        } catch (error) {
            throw error;
        }
    }

    async getCartById(id) {
        try {
            return await Carts.getInstance().getCartById(id);
        } catch (error) {
            throw error;
        }
    }

    async addProduct(cart, product, quantity) {
        try {
            return await Carts.getInstance().addProduct(cart, product, quantity);
        } catch (error) {
            throw error;
        }
    }

    async updateProductQuantity(cart, product, quantity) {
        try {
            return await Carts.getInstance().updateProductQuantity(cart, product, quantity);
        } catch (error) {
            throw error;
        }
    }

    async removeProduct(cart, product) {
        try {
            return await Carts.getInstance().removeProduct(cart, product);
        } catch (error) {
            throw error;
        }
    }

    async deleteCart(id) {
        try {
            return await Carts.getInstance().deleteCart(id);
        } catch (error) {
            throw error;
        }
    }

    async purchaseCart(cart, user) {
        try {
            const productsNotPurchased = [];
            let isProductPurchased = false;
            let amount = 0;
            for (const item of cart.products) {
                if (item.product.stock >= item.quantity) {
                    amount += item.product.price * item.quantity;
                    cart.products = cart.products.filter(i => i.product._id !== item.product._id);
                    isProductPurchased = true;
                    item.product.stock -= item.quantity;
                    if (item.product.stock === 0) {
                        item.product.status = false;
                    }
                    await ProductsRepository.getInstance().updateProduct(item.product._id, item.product);
                } else {
                    productsNotPurchased.push(item.product.title);
                }
            }
            if (!isProductPurchased) {
                return { ticket: null, productsNotPurchased };
            }
            cart = await Carts.getInstance().updateCart(cart);
            const ticket = await TicketsRepository.getInstance().createTicket({ amount, purchaser: user.email });
            if (productsNotPurchased.length > 0) {
                return { ticket, productsNotPurchased };
            }
            return { ticket, productsNotPurchased: null };
        } catch (error) {
            throw error;
        }
    }
}