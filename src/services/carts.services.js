import { Carts } from "../dao/factory.js";
import ProductsServices from "./products.services.js";
import TicketsServices from "./tickets.services.js";
import MailingServices from "./mailing.services.js";

export default class CartsServices {
  static async getCartById(id) {
    try {
      return await Carts.getInstance().getCartById(id);
    } catch (error) {
      throw error;
    }
  }

  static async createCart() {
    try {
      return await Carts.getInstance().createCart();
    } catch (error) {
      throw error;
    }
  }

  static async clearCart(id) {
    try {
      return await Carts.getInstance().clearCart(id);
    } catch (error) {
      throw error;
    }
  }

  static async deleteCart(id) {
    try {
      return await Carts.getInstance().deleteCart(id);
    } catch (error) {
      throw error;
    }
  }

  static async addProduct(cart, product, quantity) {
    try {
      return await Carts.getInstance().addProduct(cart, product, quantity);
    } catch (error) {
      throw error;
    }
  }

  static async updateProductQuantity(cart, product, quantity) {
    try {
      return await Carts.getInstance().updateProductQuantity(
        cart,
        product,
        quantity
      );
    } catch (error) {
      throw error;
    }
  }

  static async removeProduct(cart, product) {
    try {
      return await Carts.getInstance().removeProduct(cart, product);
    } catch (error) {
      throw error;
    }
  }

  static async purchaseCart(cart, user) {
    try {
      const productsNotPurchased = [];
      let isProductPurchased = false;
      let amount = 0;
      for (const item of cart.products) {
        if (item.product.stock >= item.quantity) {
          amount += item.product.price * item.quantity;
          cart.products = cart.products.filter(
            (i) => i.product._id !== item.product._id
          );
          isProductPurchased = true;
          item.product.stock -= item.quantity;
          await ProductsServices.updateProduct(item.product._id, item.product);
        } else {
          productsNotPurchased.push(item.product.title);
        }
      }
      if (!isProductPurchased) {
        return { ticket: null, productsNotPurchased };
      }
      cart = await Carts.getInstance().updateCart(cart);
      const ticket = await TicketsServices.createTicket({
        amount,
        purchaser: user.email,
      });
      await MailingServices.getInstance().sendPurchaseConfirmationEmail(
        user,
        ticket
      );
      if (productsNotPurchased.length > 0) {
        return { ticket, productsNotPurchased };
      }
      return { ticket, productsNotPurchased: null };
    } catch (error) {
      throw error;
    }
  }
}
