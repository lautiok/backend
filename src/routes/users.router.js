import CustomRouter from './custom.router.js';
import UsersController from '../controllers/users.controller.js';
import uploader from '../config/multer.config.js';

export default class UsersRouter extends CustomRouter {
    static #instance;

    constructor() {
        super();
    }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new UsersRouter();
        }
        return this.#instance;
    }

    init() {
        this.get('/', ['ADMIN'], UsersController.getUsers);

        this.get('/:uid', ['USER', 'PREMIUM', 'ADMIN'], UsersController.getUserById);

        this.post('/:uid/documents', ['USER', 'PREMIUM'], uploader, UsersController.uploadUserDocuments);

        this.put('/premium/:uid', ['USER', 'PREMIUM', 'ADMIN'], UsersController.changeUserRole);

        this.delete('/', ['ADMIN'], UsersController.deleteInactiveUsers);

        this.delete('/:uid', ['ADMIN'], UsersController.deleteUser);
    }
}