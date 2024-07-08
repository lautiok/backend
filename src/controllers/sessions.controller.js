import { generateToken, validateToken } from "../utils/tokens.utils.js";
import UsersServices from "../services/users.services.js";
import MailingServices from "../services/mailing.services.js";
import { isValidPassword } from "../utils/passwords.utils.js";
import dotenv from "dotenv";

dotenv.config();

export default class SessionsController {
  static register(req, res) {
    const user = req.user;
    req.logger.info(`Usuario id ${user._id} registrado exitosamente`);
    res.sendSuccess(user);
  }

  static async login(req, res) {
    try {
      let user = req.user;
      const token = generateToken(user);
      res.cookie("token", token, {
        maxAge: process.env.COOKIE_MAX_AGE,
        httpOnly: true,
        signed: true,
      });
      if (user.role !== "admin") {
        user = await UsersServices.getUserById(user._id);
        user.last_connection = new Date();
        user = await UsersServices.updateUser(user._id, user);
      }
      req.logger.info(`Sesión de usuario id ${user._id} iniciada exitosamente`);
      res.sendSuccess(user);
    } catch (error) {
      req.logger.error(
        `Error al iniciar sesión de usuario id ${user._id}: ${error.message}`
      );
      res.sendServerError(error.message);
    }
  }

  static githubCallback(req, res) {
    const user = req.user;
    const token = generateToken(user);
    res.cookie("token", token, {
      maxAge: process.env.COOKIE_MAX_AGE,
      httpOnly: true,
      signed: true,
    });
    req.logger.info(
      `Sesión de usuario id ${user._id} iniciada exitosamente con GitHub`
    );
    res.redirect("/products");
  }

  static async restorePassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        req.logger.warning("El campo correo electrónico es obligatorio");
        return res.sendUserError("El campo correo electrónico es obligatorio");
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        req.logger.warning("El correo electrónico ingresado no es válido");
        return res.sendUserError(
          "El correo electrónico ingresado no es válido"
        );
      }
      const user = await UsersServices.getUserByEmail(email);
      if (!user) {
        req.logger.warning(
          `No existe un usuario registrado con el correo electrónico ${email}`
        );
        return res.sendUserError(
          `No existe un usuario registrado con el correo electrónico ${email}`
        );
      }
      const token = generateToken({ email });
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      await MailingServices.getInstance().sendResetPasswordEmail(
        user,
        resetLink
      );
      req.logger.info(
        `Enlace de restauración de contraseña enviado exitosamente a usuario id ${user._id}`
      );
      res.sendSuccess(token);
    } catch (error) {
      req.loger.error(
        `Error al restaurar contraseña de usuario id ${user._id}: ${error.message}`
      );
      res.sendServerError(error.message);
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      if (!password) {
        req.logger.warning("El campo contraseña es obligatorio");
        return res.sendUserError("El campo contraseña es obligatorio");
      }
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        req.logger.warning(
          "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un caracter especial"
        );
        return res.sendUserError(
          "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula, un número y un caracter especial"
        );
      }
      const decoded = validateToken(token);
      if (!decoded) {
        req.logger.warning("No se ha proporcionado un token válido");
        return res.sendUserError("No se ha proporcionado un token válido");
      }
      const user = await UsersServices.getUserByEmail(decoded.email);
      if (!user) {
        req.logger.warning(
          "No se ha encontrado un usuario asociado al token proporcionado"
        );
        return res.sendUserError(
          "No se ha encontrado un usuario asociado al token proporcionado"
        );
      }
      if (isValidPassword(password, user)) {
        req.logger.warning(
          "La nueva contraseña no puede ser igual a la anterior"
        );
        return res.sendUserError(
          "La nueva contraseña no puede ser igual a la anterior"
        );
      }
      user.password = password;
      await UsersServices.updateUserPassword(user._id, user);
      req.logger.info(
        `Contraseña de usuario id ${user._id} reestablecida exitosamente`
      );
      res.sendSuccess(user);
    } catch (error) {
      req.logger.error(
        `Error al reestablecer contraseña de usuario id ${user._id}: ${error.message}`
      );
      res.sendServerError(error.message);
    }
  }

  static current(req, res) {
    const user = req.user;
    res.sendSuccess(user);
  }

  static async logout(req, res) {
    try {
      let user = req.user;
      res.clearCookie("token");
      if (user.role !== "admin") {
        user = await UsersServices.getUserById(user._id);
        user.last_connection = new Date();
        await UsersServices.updateUser(user._id, user);
      }
      req.logger.info(`Sesión de usuario id ${user._id} cerrada exitosamente`);
      res.sendSuccess(user);
    } catch (error) {
      req.logger.error(
        `Error al cerrar sesión de usuario id ${user._id}: ${error.message}`
      );
      res.sendServerError(error.message);
    }
  }
}
