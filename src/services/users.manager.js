import userModel from "../dao/models/user.model.js";
import  CartsManagerDB  from "../dao/models/cart.model.js";
import { createHash } from "../utils.js";

export class UsersManager {
    static #instance;

    constructor() { }

    // Método para obtener la instancia única de UsersManager
    static getInstance() {
        if (!UsersManager.#instance) {
            UsersManager.#instance = new UsersManager();
        }
        return UsersManager.#instance;
    }
    // Método para obtener un usuario por su correo electrónico
    async getUserByEmail(email) {
        try {
            const user = await userModel.findOne({ email });
            return user;
        } catch (error) {
            throw error;
        }
    }
    // Método para crear un nuevo usuario
    async createUser(user) {
        try {
            if (user.password && user.password.length > 0) {
                user.password = createHash(user.password);
            }
            const cart = await CartsManagerDB.getInstance().createCart();
            user.cart = cart._id;
            const newUser = await userModel.create(user);
            if (!newUser) {
                throw new Error('No se pudo crear el usuario');
            }
            return newUser;
        } catch (error) {
            throw error;
        }
    }
}