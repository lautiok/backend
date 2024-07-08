import ProductsServices from "../services/products.services.js";
import CartsServices from "../services/carts.services.js";
import UsersServices from "../services/users.services.js";

export default class ViewsController {
  static #instance;

  constructor() {}

  static getInstance() {
    if (!this.#instance) {
      this.#instance = new ViewsController();
    }
    return this.#instance;
  }

  renderLogin(req, res) {
    res.render("general/login");
  }

  renderRegister(req, res) {
    res.render("general/register");
  }

  renderRestorePassword(req, res) {
    res.render("general/restore-password");
  }

  renderResetPassword(req, res) {
    const { token } = req.query;
    res.render("general/reset-password", { token });
  }

  async renderProducts(req, res) {
    try {
      const queryParams = req.query;
      const user = req.user;
      user.isPremium = user.role === "premium";
      const payload = await ProductsServices.getProducts(queryParams);
      const { docs: products, ...pagination } = payload;
      const baseUrl = "/products";
      if (pagination.hasPrevPage) {
        pagination.prevLink = `${baseUrl}?${new URLSearchParams({
          ...queryParams,
          page: pagination.page - 1,
        }).toString()}`;
      }
      if (pagination.hasNextPage) {
        pagination.nextLink = `${baseUrl}?${new URLSearchParams({
          ...queryParams,
          page: pagination.page + 1,
        }).toString()}`;
      }
      res.render("user/products", { user, products, pagination });
    } catch (error) {
      res.sendServerError(error.message);
    }
  }

  async renderProduct(req, res) {
    try {
      const { pid } = req.params;
      const user = req.user;
      const product = await ProductsServices.getProductById(pid);
      res.render("user/product", { user, product });
    } catch (error) {
      res.sendServerError(error.message);
    }
  }

  async renderCart(req, res) {
    try {
      const { cid } = req.params;
      const cart = await CartsServices.getCartById(cid);
      cart.products = cart.products.map((product) => {
        return {
          ...product,
          total: product.product.price * product.quantity,
        };
      });
      cart.total = cart.products
        .reduce((acc, product) => acc + product.total, 0)
        .toFixed(2);
      res.render("user/cart", { cart });
    } catch (error) {
      res.sendServerError(error.message);
    }
  }

  renderProfile(req, res) {
    const user = req.user;
    res.render("user/profile", { user });
  }

  renderUploadDocuments(req, res) {
    const user = req.user;
    res.render("user/upload-documents", { user });
  }

  renderChat(req, res) {
    const user = req.user;
    res.render("user/chat", { user });
  }

  async renderPremiumProducts(req, res) {
    try {
      const queryParams = req.query;
      const user = req.user;
      queryParams.owner = user.email;
      const payload = await ProductsServices.getProducts(queryParams);
      const { docs: products, ...pagination } = payload;
      const baseUrl = "/premium/products";
      if (pagination.hasPrevPage) {
        pagination.prevLink = `${baseUrl}?${new URLSearchParams({
          ...queryParams,
          page: pagination.page - 1,
        }).toString()}`;
      }
      if (pagination.hasNextPage) {
        pagination.nextLink = `${baseUrl}?${new URLSearchParams({
          ...queryParams,
          page: pagination.page + 1,
        }).toString()}`;
      }
      res.render("premium/products", { user, products, pagination });
    } catch (error) {
      res.sendServerError(error.message);
    }
  }

  async renderPremiumProduct(req, res) {
    try {
      const { pid } = req.params;
      const user = req.user;
      const product = await ProductsServices.getProductById(pid);
      res.render("premium/product", { user, product });
    } catch (error) {
      res.sendServerError(error.message);
    }
  }

  async renderPremiumAddProduct(req, res) {
    const user = req.user;
    res.render("premium/add-product", { user });
  }

  async renderPremiumEditProduct(req, res) {
    try {
      const { pid } = req.params;
      const user = req.user;
      const product = await ProductsServices.getProductById(pid);
      res.render("premium/edit-product", { user, product });
    } catch (error) {
      res.sendServerError(error.message);
    }
  }

  renderAdminMain(req, res) {
    res.render("admin/main");
  }

  async renderAdminProducts(req, res) {
    try {
      const queryParams = req.query;
      const payload = await ProductsServices.getProducts(queryParams);
      const { docs: products, ...pagination } = payload;
      const baseUrl = "/admin/products";
      if (pagination.hasPrevPage) {
        pagination.prevLink = `${baseUrl}?${new URLSearchParams({
          ...queryParams,
          page: pagination.page - 1,
        }).toString()}`;
      }
      if (pagination.hasNextPage) {
        pagination.nextLink = `${baseUrl}?${new URLSearchParams({
          ...queryParams,
          page: pagination.page + 1,
        }).toString()}`;
      }
      res.render("admin/products", { products, pagination });
    } catch (error) {
      res.sendServerError(error.message);
    }
  }

  async renderAdminProduct(req, res) {
    try {
      const { pid } = req.params;
      const product = await ProductsServices.getProductById(pid);
      res.render("admin/product", { product });
    } catch (error) {
      res.sendServerError(error.message);
    }
  }

  renderAdminAddProduct(req, res) {
    res.render("admin/add-product");
  }

  async renderAdminEditProduct(req, res) {
    try {
      const { pid } = req.params;
      const product = await ProductsServices.getProductById(pid);
      res.render("admin/edit-product", { product });
    } catch (error) {
      res.sendServerError(error.message);
    }
  }

  async renderAdminUsers(req, res) {
    try {
      const queryParams = req.query;
      const payload = await UsersServices.getUsers(queryParams);
      const { docs: users, ...pagination } = payload;
      const baseUrl = "/admin/users";
      if (pagination.hasPrevPage) {
        pagination.prevLink = `${baseUrl}?${new URLSearchParams({
          page: pagination.prevPage,
        }).toString()}`;
      }
      if (pagination.hasNextPage) {
        pagination.nextLink = `${baseUrl}?${new URLSearchParams({
          page: pagination.nextPage,
        }).toString()}`;
      }
      res.render("admin/users", { users, pagination });
    } catch (error) {
      res.sendServerError(error.message);
    }
  }

  async renderAdminUser(req, res) {
    try {
      const { uid } = req.params;
      const user = await UsersServices.getUserById(uid);
      res.render("admin/user", { user });
    } catch (error) {
      res.sendServerError(error.message);
    }
  }

  renderNotFound(req, res) {
    res.redirect("/");
  }
}
