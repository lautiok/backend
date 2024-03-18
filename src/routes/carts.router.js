import express from 'express';
import { CartsManagerDB } from '../dao/carts.manager.DB.js';

// Crear un enrutador de Express
const router = express.Router();

// Obtener un carrito por su ID
router.get('/:cid', async (req, res) => {
    try {
        const id = req.params.cid;
        const cart = await CartsManagerDB.getInstance().getCartById(id);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const cart = await CartsManagerDB.getInstance().createCart();
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Agregar un producto al carrito
router.post('/:cid/products/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity ?? 1;
        const cart = await CartsManagerDB.getInstance().addProduct(cartId, productId, quantity);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar un carrito
router.put('/:cid', async (req, res) => {
    try {
        const id = req.params.cid;
        const products = req.body.products ?? [];
        const cart = await CartsManagerDB.getInstance().updateCart(id, products);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar la cantidad de un producto en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const quantity = req.body.quantity ?? 1;
        const cart = await CartsManagerDB.getInstance().updateProductQuantity(cartId, productId, quantity);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un carrito por su ID
router.delete('/:cid', async (req, res) => {
    try {
        const id = req.params.cid;
        const cart = await CartsManagerDB.getInstance().deleteCart(id);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un producto del carrito por su ID
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const cart = await CartsManagerDB.getInstance().removeProduct(cartId, productId);
        res.json({ status: 'success', payload: cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Exportar el enrutador
export default router;
