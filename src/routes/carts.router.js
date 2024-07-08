import CustomRouter from "./custom.router.js";
import CartsController from "../controllers/carts.controller.js";

export default class CartsRouter extends CustomRouter {
  static #instance;

  constructor() {
    super();
  }

  static getInstance() {
    if (!this.#instance) {
      this.#instance = new CartsRouter();
    }
    return this.#instance;
  }

  init() {
    this.get(
      "/:cid",
      ["USER", "PREMIUM", "ADMIN"],
      CartsController.getCartById
    );

    this.post("/", ["ADMIN"], CartsController.createCart);

    this.put("/:cid", ["USER", "PREMIUM", "ADMIN"], CartsController.clearCart);

    this.delete("/:cid", ["ADMIN"], CartsController.deleteCart);

    this.post(
      "/:cid/products/:pid",
      ["USER", "PREMIUM", "ADMIN"],
      this.validateProductQuantity,
      CartsController.addProduct
    );

    this.put(
      "/:cid/products/:pid",
      ["USER", "PREMIUM", "ADMIN"],
      this.validateProductQuantity,
      CartsController.updateProductQuantity
    );

    this.delete(
      "/:cid/products/:pid",
      ["USER", "PREMIUM", "ADMIN"],
      CartsController.removeProduct
    );

    this.post(
      "/:cid/purchase",
      ["USER", "PREMIUM"],
      CartsController.purchaseCart
    );
  }

  validateProductQuantity(req, res, next) {
    req.quantity = req.body.quantity
      ? parseInt(req.body.quantity) < 1 || isNaN(parseInt(req.body.quantity))
        ? 1
        : parseInt(req.body.quantity)
      : 1;
    next();
  }
}
