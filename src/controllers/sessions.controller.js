import { generateToken, validateToken } from '../utils.js';
import UsersRepository from '../repositories/users.repository.js';
import MailingServices from '../services/mailing.services.js';
import dotenv from 'dotenv';

dotenv.config();

export default class SessionsController {
    static #instance;

    constructor() { }

    static getInstance() {
        if (!this.#instance) {
            this.#instance = new SessionsController();
        }
        return this.#instance;
    }

    register(req, res) {
        req.logger.info('Usuario registrado exitosamente');
        res.sendSuccessMessage('Usuario registrado exitosamente');
    }

    login(req, res) {
        const user = req.user;
        const token = generateToken(user);
        res.cookie('token', token, { maxAge: process.env.COOKIE_MAX_AGE, httpOnly: true, signed: true });
        req.logger.info('Sesión iniciada exitosamente');
        res.sendSuccessPayload(req.user);
    }

    githubCallback(req, res) {
        const user = req.user;
        const token = generateToken(user);
        res.cookie('token', token, { maxAge: process.env.COOKIE_MAX_AGE, httpOnly: true, signed: true });
        req.logger.info('Sesión con GitHub iniciada exitosamente');
        res.redirect('/products');
    }

    async restorePassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                req.logger.warn('El campo correo electrónico es obligatorio');
                return res.sendUserError('El campo correo electrónico es obligatorio');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                req.logger.warn('El correo electrónico ingresado no es válido');
                return res.sendUserError('El correo electrónico ingresado no es válido');
            }
            const user = await UsersRepository.getInstance().getUserByEmail(email);
            if (!user) {
                req.logger.warn(`No existe un usuario registrado con el correo electrónico ${email}`);
                return res.sendUserError(`No existe un usuario registrado con el correo electrónico ${email}`);
            }
            const token = generateToken({ email });
            const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
            await MailingServices.getInstance().sendResetPasswordEmail(user, resetLink);
            req.logger.info(`Se ha enviado un correo electrónico a ${user.email} con las instrucciones para restaurar tu contraseña`);
            res.sendSuccessMessage(`Se ha enviado un correo electrónico a ${user.email} con las instrucciones para restaurar tu contraseña`);
        } catch (error) {
            req.loger.error(`Error al restaurar contraseña: ${error.message}`);
            res.sendServerError(error.message);
        }
    }

    async resetPassword(req, res) {
        try {
            const { token, password } = req.body;
            if (!password) {
                req.logger.warn('El campo contraseña es obligatorio');
                return res.sendUserError('El campo contraseña es obligatorio');
            }
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
                req.logger.warn('La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un caracter especial');
                return res.sendUserError('La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un caracter especial');
            }
            const decoded = validateToken(token);
            if (!decoded) {
                req.logger.warn('No se ha proporcionado un token válido');
                return res.sendUserError('No se ha proporcionado un token válido');
            }
            const user = await UsersRepository.getInstance().getUserByEmail(decoded.email);
            if (!user) {
                req.logger.warn('No se ha encontrado un usuario asociado al token proporcionado');
                return res.sendUserError('No se ha encontrado un usuario asociado al token proporcionado');
            }
            user.password = password;
            await UsersRepository.getInstance().updateUserPassword(user._id, user);
            req.logger.info('Contraseña reestablecida exitosamente');
            res.sendSuccessMessage('Contraseña reestablecida exitosamente');
        } catch (error) {
            req.logger.error(`Error al reestablecer contraseña: ${error.message}`);
            res.sendServerError(error.message);
        }
    }

    current(req, res) {
        res.sendSuccessPayload(req.user);
    }

    logout(req, res) {
        res.clearCookie('token');
        req.logger.info('Sesión cerrada exitosamente');
        res.sendSuccessMessage('Sesión cerrada exitosamente');
    }
}