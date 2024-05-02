import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker/locale/es';

const __dirname = dirname(fileURLToPath(import.meta.url));

function createHash(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

function isValidPassword(password, user) {
    return bcrypt.compareSync(password, user.password);
}

function generateToken(user) {
    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1d' });
}

function validateToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
}

function generateFakerProduct() {
    return {
        _id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        code: `${faker.string.alpha({ length: 3, casing: 'upper', })}${faker.number.int(9)}${faker.number.int(9)}${faker.number.int(9)}`,
        price: faker.commerce.price(),
        status: faker.datatype.boolean(),
        stock: faker.number.int({ min: 10, max: 1000 }),
        category: faker.commerce.department(),
        thumbnails: [faker.image.url(), faker.image.url()]
    };
}

export { __dirname, createHash, isValidPassword, generateToken, validateToken, generateFakerProduct };