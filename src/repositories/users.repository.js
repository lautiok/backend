import { createHash } from '../utils.js';
import CartsRepository from '../repositories/carts.repository.js';
import UserDTO from '../dao/dtos/user.dto.js';
import { Users } from '../dao/factory.js';

export default class UsersRepository {
    static #instance;

    constructor() { }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new UsersRepository();
        }
        return this.#instance;
    }

    async createUser(user) {
        try {
            if (user.password && user.password.length > 0) {
                user.password = createHash(user.password);
            }
            const cart = await CartsRepository.getInstance().createCart();
            user.cart = cart._id;
            const newUser = new UserDTO(user);
            return await Users.getInstance().createUser(newUser);
        } catch (error) {
            throw error;
        }
    }

    async getUserByEmail(email) {
        try {
            return await Users.getInstance().getUserByEmail(email);
        } catch (error) {
            throw error;
        }
    }

    async updateUserPassword(id, user) {
        try {
            if (user.password && user.password.length > 0) {
                user.password = createHash(user.password);
            }
            const updatedUser = new UserDTO(user);
            return await Users.getInstance().updateUser(id, updatedUser);
        } catch (error) {
            throw error;
        }
    }
}