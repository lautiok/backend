import express from 'express';
import { obtenerCarritoPorId, crearCarrito, agregarProductoAlCarrito, actualizarCarrito, actualizarCantidadProductoEnCarrito, eliminarCarritoPorId, eliminarProductoDelCarrito } from '../controllers/carts.controller.js';

const router = express.Router();

router.get('/:cid', obtenerCarritoPorId);
router.post('/', crearCarrito);
router.post('/:cid/products/:pid', agregarProductoAlCarrito);
router.put('/:cid', actualizarCarrito);
router.put('/:cid/products/:pid', actualizarCantidadProductoEnCarrito);
router.delete('/:cid', eliminarCarritoPorId);
router.delete('/:cid/products/:pid', eliminarProductoDelCarrito);

export default router;
