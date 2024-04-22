import ProductsRepository from '../repositories/products.repository.js';
import CartsRepository from '../repositories/carts.repository.js';

export default class ViewsController {
    static #instance;

    constructor() { }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new ViewsController();
        }
        return this.#instance;
    }

    renderIndex(req, res) {
        res.render('general/login');
    }


    renderRegister(req, res) {
        res.render('general/register');
    }

    renderRestorePassword(req, res) {
        res.render('general/restore-password');
    }

    renderResetPassword(req, res) {
        const { token } = req.query;
        res.render('general/reset-password', { token });
    }

    async renderProducts(req, res) {
        try {
            const queryParams = req.query;
            const user = req.user;
            const payload = await ProductsRepository.getInstance().getProducts(queryParams);
            const { docs: products, ...pagination } = payload;
            res.render('user/products', { user, products, pagination });
        } catch (error) {
            console.log(error);
            res.sendServerError(error.message);
        }
    }

    async renderProduct(req, res) {
        try {
            const { pid } = req.params;
            const user = req.user;
            const product = await ProductsRepository.getInstance().getProductById(pid);
            res.render('user/product', { user, product });
        } catch (error) {
            console.log(error);
            res.sendServerError(error.message);
        }
    }

    async renderCart(req, res) {
        try {
            const { cid } = req.params;
            const cart = await CartsRepository.getInstance().getCartById(cid);
            cart.products = cart.products.map(product => {
                return {
                    ...product,
                    total: product.product.price * product.quantity
                };
            });
            cart.total = cart.products.reduce((acc, product) => acc + product.total, 0).toFixed(2);
            res.render('user/cart', { cart });
        } catch (error) {
            console.log(error);
            res.sendServerError(error.message);
        }
    }

    renderProfile(req, res) {
        const user = req.user;
        res.render('user/profile', { user });
    }

    renderChat(req, res) {
        const user = req.user;
        res.render('user/chat', { user });
    }

    async renderAdminProducts(req, res) {
        try {
            const queryParams = req.query;
            const user = req.user;
            const payload = await ProductsRepository.getInstance().getProducts(queryParams);
            const { docs: products, ...pagination } = payload;
            if (pagination.prevLink) {
                pagination.prevLink = '/admin' + pagination.prevLink;
            }
            if (pagination.nextLink) {
                pagination.nextLink = '/admin' + pagination.nextLink;
            }
            res.render('admin/products', { user, products, pagination });
        } catch (error) {
            res.sendServerError(error.message);
        }
    }

    async renderAdminProduct(req, res) {
        try {
            const { pid } = req.params;
            const product = await ProductsRepository.getInstance().getProductById(pid);
            res.render('admin/product', { product });
        } catch (error) {
            console.log(error);
            res.sendServerError(error.message);
        }
    }

    renderAdminAddProduct(req, res) {
        res.render('admin/add-product');
    }

    async renderAdminEditProduct(req, res) {
        try {
            const { pid } = req.params;
            const product = await ProductsRepository.getInstance().getProductById(pid);
            res.render('admin/edit-product', { product });
        } catch (error) {
            res.sendServerError(error.message);
        }
    }

    renderNotFound(req, res) {
        res.redirect('/');
    }
}