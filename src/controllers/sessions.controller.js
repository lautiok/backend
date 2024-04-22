import { generateToken, validateToken } from '../utils.js';
import UsersRepository from '../repositories/users.repository.js';
import transport from '../config/nodemailer.config.js';
import dotev from 'dotenv';

dotev.config();

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
        res.sendSuccessMessage('Usuario registrado exitosamente');
    }

    login(req, res) {
        const user = req.user;
        const token = generateToken(user);
        res.cookie('token', token, { maxAge: process.env.COOKIE_MAX_AGE, httpOnly: true, signed: true });
        res.sendSuccessPayload(req.user);
    }

    githubCallback(req, res) {
        const user = req.user;
        const token = generateToken(user);
        res.cookie('token', token, { maxAge: process.env.COOKIE_MAX_AGE, httpOnly: true, signed: true });
        res.redirect('/products');
    }

    async restorePassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.sendUserError('El campo correo electrónico es obligatorio');
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.sendUserError('El correo electrónico ingresado no es válido');
            }
            const user = await UsersRepository.getInstance().getUserByEmail(email);
            if (!user) {
                return res.sendUserError(`No existe un usuario registrado con el correo electrónico ${email}`);
            }
            const token = generateToken({ email });
            const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
            transport.sendMail({
                from: `Programación Backend <${process.env.EMAIL}>`,
                to: user.email,
                subject: 'Reestablecer contraseña',
                html:
                    `<p>Hola ${user.first_name},</p>
                    <p>Para reestablecer tu contraseña, haz clic en el siguiente enlace:</p>
                    <a href="${resetLink}">Reestablecer contraseña</a>
                    <p>Si no solicitaste reestablecer tu contraseña, ignora este mensaje.</p>`
            });
            res.sendSuccessMessage(`Se ha enviado un correo electrónico a ${user.email} con las instrucciones para restaurar tu contraseña`);
        } catch (error) {
            console.log(error);
            res.sendServerError(error.message);
        }
    }

    async resetPassword(req, res) {
        try {
            const { token, password } = req.body;
            if (!password) {
                return res.sendUserError('El campo contraseña es obligatorio');
            }
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!passwordRegex.test(password)) {
                return res.sendUserError('La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un caracter especial');
            }
            const decoded = validateToken(token);
            if (!decoded) {
                return res.sendUserError('No se ha proporcionado un token válido');
            }
            const user = await UsersRepository.getInstance().getUserByEmail(decoded.email);
            if (!user) {
                return res.sendUserError('No se ha encontrado un usuario asociado al token proporcionado');
            }
            user.password = password;
            await UsersRepository.getInstance().updateUserPassword(user._id, user);
            res.sendSuccessMessage('Contraseña reestablecida exitosamente');
        } catch (error) {
            console.log(error);
            res.sendServerError(error.message);
        }
    }

    current(req, res) {
        res.sendSuccessPayload(req.user);
    }

    logout(req, res) {
        res.clearCookie('token');
        res.sendSuccessMessage('Sesión cerrada exitosamente');
    }
}