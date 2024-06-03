import CustomRouter from './custom.router.js';
import ViewsController from '../controllers/views.controller.js';

export default class ViewsRouter extends CustomRouter {
    static #instance;

    constructor() {
        super();
    }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new ViewsRouter();
        }
        return this.#instance;
    }

    init() {
        this.get('/', ['PUBLIC'], ViewsController.getInstance().renderIndex);

        this.get('/login', ['PUBLIC'], ViewsController.getInstance().renderLogin);

        this.get('/register', ['PUBLIC'], ViewsController.getInstance().renderRegister);

        this.get('/restorepassword', ['PUBLIC'], ViewsController.getInstance().renderRestorePassword);

        this.get('/resetpassword', ['PUBLIC'], ViewsController.getInstance().renderResetPassword);

        this.get('/products', ['USER'], ViewsController.getInstance().renderProducts);

        this.get('/product/:pid', ['USER'], ViewsController.getInstance().renderProduct);

        this.get('/cart/:cid', ['USER'], ViewsController.getInstance().renderCart);

        this.get('/profile', ['USER'], ViewsController.getInstance().renderProfile);

        this.get('/chat', ['USER'], ViewsController.getInstance().renderChat);

        this.get('/premium/products', ['PREMIUM'], ViewsController.getInstance().renderPremiumProducts);

        this.get('/premium/product/:pid', ['PREMIUM'], ViewsController.getInstance().renderPremiumProduct);

        this.get('/premium/addproduct', ['PREMIUM'], ViewsController.getInstance().renderPremiumAddProduct);

        this.get('/premium/editproduct/:pid', ['PREMIUM'], ViewsController.getInstance().renderPremiumEditProduct);

        this.get('/admin/products', ['ADMIN'], ViewsController.getInstance().renderAdminProducts);

        this.get('/admin/product/:pid', ['ADMIN'], ViewsController.getInstance().renderAdminProduct);

        this.get('/admin/addproduct', ['ADMIN'], ViewsController.getInstance().renderAdminAddProduct);

        this.get('/admin/editproduct/:pid', ['ADMIN'], ViewsController.getInstance().renderAdminEditProduct);

        this.get('*', ['ALL'], ViewsController.getInstance().renderNotFound);
    }
}