import CartsServices from "../services/carts.services.js";
import ProductsServices from "../services/products.services.js";

export default class CartsController {
  static async getCartById(req, res) {
    try {
      const { cid } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.cart != cid) {
        req.logger.warning(
          `El usuario id ${user._id} no puede consultar el carrito id ${cid} porque no le pertenece`
        );
        return res.sendUserError(
          `El usuario ${user._id} no puede consultar el carrito id ${cid} porque no le pertenece`
        );
      }
      const payload = await CartsServices.getCartById(cid);
      if (!payload) {
        req.logger.warning(`No existe un carrito con el id ${cid}`);
        return res.sendUserError(`No existe un carrito con el id ${cid}`);
      }
      req.logger.info(`Consulta de carrito id ${cid} exitosa`);
      res.sendSuccess(payload);
    } catch (error) {
      req.logger.error(
        `Error al consultar carrito id ${cid}: ${error.message}`
      );
      res.sendServerError(error.message);
    }
  }

  static async createCart(req, res) {
    try {
      const payload = await CartsServices.createCart();
      req.logger.info(`Carrito id ${payload._id} creado `);
      res.sendSuccess(payload);
    } catch (error) {
      req.logger.error(`Error al crear carrito: ${error.message}`);
      res.sendServerError(error.message);
    }
  }

  static async clearCart(req, res) {
    try {
      const { cid } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.cart != cid) {
        req.logger.warning(
          `El usuario id ${user._id} no puede vaciar el carrito id ${cid} porque no le pertenece`
        );
        return res.sendUserError(
          `El usuario ${user._id} no puede vaciar el carrito id ${cid} porque no le pertenece`
        );
      }
      const cart = await CartsServices.getCartById(cid);
      if (!cart) {
        req.logger.warning(`No existe un carrito con el id ${cid}`);
        return res.sendUserError(`No existe un carrito con el id ${cid}`);
      }
      const payload = await CartsServices.clearCart(cid);
      req.logger.info(`Carrito id ${cid} vaciado exitosamente`);
      res.sendSuccess(payload);
    } catch (error) {
      req.logger.error(`Error al vaciar carrito id ${cid}: ${error.message}`);
      res.sendServerError(error.message);
    }
  }

  static async deleteCart(req, res) {
    try {
      const { cid } = req.params;
      const cart = await CartsServices.getCartById(cid);
      if (!cart) {
        req.logger.warning(`No existe un carrito con el id ${cid}`);
        return res.sendUserError(`No existe un carrito con el id ${cid}`);
      }
      const payload = await CartsServices.deleteCart(cid);
      req.logger.info(`Carrito id ${cid} eliminado exitosamente`);
      res.sendSuccess(payload);
    } catch (error) {
      req.logger.error(`Error al eliminar carrito id ${cid}: ${error.message}`);
      res.sendServerError(error.message);
    }
  }

  static async addProduct(req, res) {
    try {
      const { cid, pid } = req.params;
      const quantity = req.body.quantity;
      const user = req.user;
      if (user.role !== "admin" && user.cart != cid) {
        req.logger.warning(
          `El usuario id ${user._id} no puede agregar productos al carrito id ${cid} porque no le pertenece`
        );
        return res.sendUserError(
          `El usuario ${user._id} no puede agregar productos al carrito id ${cid} porque no le pertenece`
        );
      }
      const cart = await CartsServices.getCartById(cid);
      if (!cart) {
        req.logger.warning(`No existe un carrito con el id ${cid}`);
        return res.sendUserError(`No existe un carrito con el id ${cid}`);
      }
      const product = await ProductsServices.getProductById(pid);
      if (!product) {
        req.logger.warning(`No existe un producto con el id ${pid}`);
        return res.sendUserError(`No existe un producto con el id ${pid}`);
      }
      if (user.role === "premium" && product.owner === user.email) {
        req.logger.warning(
          `El producto id ${pid} pertenece al usuario id ${user._id} y no se puede agregar al carrito`
        );
        return res.sendUserError(
          `El producto id ${pid} pertenece al usuario id ${user._id} y no se puede agregar al carrito`
        );
      }
      const payload = await CartsServices.addProduct(cart, product, quantity);
      req.logger.info(
        `Producto id ${pid} agregado al carrito id ${cid} existosamente`
      );
      res.sendSuccess(payload);
    } catch (error) {
      req.logger.error(
        `Error al agregar producto id ${pid} al carrito id ${cid}: ${error.message}`
      );
      res.sendServerError(error.message);
    }
  }

  static async updateProductQuantity(req, res) {
    try {
      const { cid, pid } = req.params;
      const quantity = req.body.quantity;
      const user = req.user;
      if (user.role !== "admin" && user.cart != cid) {
        req.logger.warning(
          `El usuario id ${user._id} no puede actualizar la cantidad del producto id ${pid} en el carrito id ${cid} porque no le pertenece`
        );
        return res.sendUserError(
          `El usuario ${user._id} no puede actualizar la cantidad del producto id ${pid} en el carrito id ${cid} porque no le pertenece`
        );
      }
      const cart = await CartsServices.getCartById(cid);
      if (!cart) {
        req.logger.warning(`No existe un carrito con el id ${cid}`);
        return res.sendUserError(`No existe un carrito con el id ${cid}`);
      }
      const product = await ProductsServices.getProductById(pid);
      if (!product) {
        req.logger.warning(`No existe un producto con el id ${pid}`);
        return res.sendUserError(`No existe un producto con el id ${pid}`);
      }
      const payload = await CartsServices.updateProductQuantity(
        cart,
        product,
        quantity
      );
      if (!payload) {
        req.logger.warning(
          `No se encontro el producto con id ${pid} en el carrito con id ${cid}`
        );
        return res.sendUserError(
          `No se encontro el producto con id ${pid} en el carrito con id ${cid}`
        );
      }
      req.logger.info(
        `Cantidad del producto id ${pid} del carrito id ${cid} actualizada a ${quantity} exitosamente`
      );
      res.sendSuccess(payload);
    } catch (error) {
      req.logger.error(
        `Error al actualizar cantidad del producto id ${pid} en el carrito id ${cid}: ${error.message}`
      );
      res.sendServerError(error.message);
    }
  }

  static async removeProduct(req, res) {
    try {
      const { cid, pid } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user.cart != cid) {
        req.logger.warning(
          `El usuario id ${user._id} no puede eliminar productos del carrito id ${cid} porque no le pertenece`
        );
        return res.sendUserError(
          `El usuario ${user._id} no puede eliminar productos del carrito id ${cid} porque no le pertenece`
        );
      }
      const cart = await CartsServices.getCartById(cid);
      if (!cart) {
        req.logger.warning(`No existe un carrito con el id ${cid}`);
        return res.sendUserError(`No existe un carrito con el id ${cid}`);
      }
      const product = await ProductsServices.getProductById(pid);
      if (!product) {
        req.logger.warning(`No existe un producto con el id ${pid}`);
        return res.sendUserError(`No existe un producto con el id ${pid}`);
      }
      const payload = await CartsServices.removeProduct(cart, product);
      if (!payload) {
        req.logger.warning(
          `No se encontro el producto id ${pid} en el carrito id ${cid}`
        );
        return res.sendUserError(
          `No se encontro el producto id ${pid} en el carrito id ${cid}`
        );
      }
      req.logger.info(
        `Producto id ${pid} eliminado del carrito id ${cid} existosamente`
      );
      res.sendSuccess(payload);
    } catch (error) {
      req.logger.error(
        `Error al eliminar producto id ${pid} del carrito id ${cid}: ${error.message}`
      );
      res.sendServerError(error.message);
    }
  }

  static async purchaseCart(req, res) {
    try {
      const { cid } = req.params;
      const user = req.user;
      const cart = await CartsServices.getCartById(cid);
      if (!cart) {
        req.logger.warning(`No existe un carrito con el id ${cid}`);
        return res.sendUserError(`No existe un carrito con el id ${cid}`);
      }
      if (user.cart != cid) {
        req.logger.warning(
          `El usuario id ${user._id} no puede comprar el carrito id ${cid} porque no le pertenece`
        );
        return res.sendUserError(
          `El usuario ${user._id} no puede comprar el carrito id ${cid} porque no le pertenece`
        );
      }
      const payload = await CartsServices.purchaseCart(cart, user);
      if (payload.productsNotPurchased && !payload.ticket) {
        req.logger.warning(
          "No se pudo realizar la compra porque no hay stock suficiente de los productos del carrito"
        );
        return res.sendUserError(
          "No se pudo realizar la compra porque no hay stock suficiente de los productos del carrito"
        );
      }
      req.logger.info(`Compra del carrito id ${cid} realizada exitosamente`);
      res.sendSuccess(payload);
    } catch (error) {
      req.logger.error(`Error al comprar carrito id ${cid}: ${error.message}`);
      res.sendServerError(error.message);
    }
  }
}
