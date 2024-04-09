import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

export const __dirname = dirname(fileURLToPath(import.meta.url));

export const createHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const isValidPassword = (password, user) => bcrypt.compareSync(password, user.password);

export const generateToken = (res, user) => {
    const userWithoutPassword = {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        cart: user.cart,
        role: user.role
    };
    dotenv.config();
    const token = jwt.sign({ user: userWithoutPassword }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { maxAge: 60 * 60 * 1000, httpOnly: true, signed: true });
};