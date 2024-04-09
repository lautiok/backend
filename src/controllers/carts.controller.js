import { CartsManagerDB } from '../services/carts.manager.DB.js';

export const obtenerCarritoPorId = async (req, res) => {
    try {
        const id = req.params.cid;
        const cart = await CartsManagerDB.getInstance().getCartById(id);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const crearCarrito = async (req, res) => {
    try {
        const cart = await CartsManagerDB.getInstance().createCart();
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const agregarProductoAlCarrito = async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity ?? 1;
        const cart = await CartsManagerDB.getInstance().addProduct(cartId, productId, quantity);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarCarrito = async (req, res) => {
    try {
        const id = req.params.cid;
        const products = req.body.products ?? [];
        const cart = await CartsManagerDB.getInstance().updateCart(id, products);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const actualizarCantidadProductoEnCarrito = async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity ?? 1;
        const cart = await CartsManagerDB.getInstance().updateProductQuantity(cartId, productId, quantity);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const eliminarCarritoPorId = async (req, res) => {
    try {
        const id = req.params.cid;
        const cart = await CartsManagerDB.getInstance().deleteCart(id);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const eliminarProductoDelCarrito = async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const cart = await CartsManagerDB.getInstance().removeProduct(cartId, productId);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
