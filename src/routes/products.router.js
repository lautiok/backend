import express from 'express';
import { obtenerProductos, obtenerProductoPorId, crearProducto, actualizarProducto, eliminarProducto } from '../controllers/Products.controller.js';

const router = express.Router();

router.use((req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;
        if (!title || !description || !code || !price || !status || !stock || !category || !thumbnails) {
            return res.status(400).json({ error: 'Faltan campos obligatorios' });
        }
    }
    next();
});

router.get('/', obtenerProductos);
router.get('/:pid', obtenerProductoPorId);
router.post('/', crearProducto);
router.put('/:pid', actualizarProducto);
router.delete('/:pid', eliminarProducto);

export default router;
