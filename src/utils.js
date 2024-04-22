import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';


dotenv.config();
const __dirname = dirname(fileURLToPath(import.meta.url));

function createHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(process.env.BCRYPT_SALT));
}

function isValidPassword(password, user) {
    return bcrypt.compareSync(password, user.password);
}

function generateToken(user) {
    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
}

function validateToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}

export { __dirname, createHash, isValidPassword, generateToken, validateToken };