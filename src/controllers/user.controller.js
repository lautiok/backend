import UsersServices from "../services/users.services.js";
import UserWithoutPasswordDTO from "../dao/dtos/user.without.password.dto.js";
import { generateToken } from "../utils/tokens.utils.js";
import dotenv from "dotenv";
import CartsServices from "../services/carts.services.js";
import MailingServices from "../services/mailing.services.js";
import path from "path";

dotenv.config();

export default class UsersController {
  static async getUsers(req, res) {
    try {
      const queryParams = req.query;
      const payload = await UsersServices.getUsers(queryParams);
      payload.docs = payload.docs.map(
        (user) => new UserWithoutPasswordDTO(user)
      );
      req.logger.info("Consulta de usuarios exitosa");
      res.sendSuccess(payload);
    } catch (error) {
      req.logger.error(`Error al consultar usuarios: ${error.message}`);
      res.sendServerError(error.message);
    }
  }

  static async getUserById(req, res) {
    try {
      const { uid } = req.params;
      const user = req.user;
      if (user.role !== "admin" && user._id != uid) {
        req.logger.warning(
          `El usuario id ${user._id} no puede consultar el usuario id ${uid} porque no le pertenece`
        );
        return res.sendUserError(
          `El usuario ${user._id} no puede consultar el usuario ${uid} porque no le pertenece`
        );
      }
      const payload = await UsersServices.getUserById(uid);
      if (!payload) {
        req.logger.warning(`No existe un usuario con el id ${uid}`);
        return res.sendUserError(`No existe un usuario con el id ${uid}`);
      }
      req.logger.info(`Consulta del usuario id ${uid} exitosa`);
      res.sendSuccess(payload);
    } catch (error) {
      req.logger.error(
        `Error al consultar usuario id ${uid}: ${error.message}`
      );
      res.sendServerError(error.message);
    }
  }

  static async uploadUserDocuments(req, res) {
    try {
      const { uid } = req.params;
      const documents = req.files;
      let user = req.user;
      if (user.role !== "admin" && user._id != uid) {
        req.logger.warning(
          `El usuario id ${user._id} no puede subir documentos al usuario id ${uid} porque no le pertenece`
        );
        return res.sendUserError(
          `El usuario ${user._id} no puede subir documentos al usuario ${uid} porque no le pertenece`
        );
      }
      user = await UsersServices.getUserById(uid);
      if (!user) {
        req.logger.warning(`No existe un usuario con el id ${uid}`);
        return res.sendUserError(`No existe un usuario con el id ${uid}`);
      }
      const formatErrors = [];
      Object.keys(documents).forEach((documentKey) => {
        const documentArray = documents[documentKey];
        documentArray.forEach((document) => {
          const fileExtension = path
            .extname(document.originalname)
            .toLowerCase();
          if (fileExtension !== ".jpeg" && fileExtension !== ".jpg") {
            formatErrors.push(
              `No se puede subir el documento ${document.originalname} como ${documentKey} porque no se admite la extensión ${fileExtension}`
            );
          }
        });
      });
      if (formatErrors.length > 0) {
        req.logger.warning(formatErrors.join(", "));
        return res.sendUserError(formatErrors.join(", "));
      }
      Object.keys(documents).forEach((documentKey) => {
        const documentArray = documents[documentKey];
        documentArray.forEach((document) => {
          const existingDocument = user.documents.find(
            (doc) => doc.name === documentKey
          );
          if (existingDocument) {
            documentKey === "profile"
              ? (existingDocument.reference = `uploads/profiles/${document.filename}`)
              : `uploads/documents/${document.filename}`;
          } else {
            documentKey === "profile"
              ? user.documents.push({
                  name: documentKey,
                  reference: `uploads/profiles/${document.filename}`,
                })
              : user.documents.push({
                  name: documentKey,
                  reference: `uploads/documents/${document.filename}`,
                });
          }
        });
      });
      await UsersServices.updateUser(uid, user);
      const UserWithoutPassword = new UserWithoutPasswordDTO(user);
      req.user = { ...UserWithoutPassword };
      const token = generateToken(req.user);
      res.cookie("token", token, {
        maxAge: process.env.COOKIE_MAX_AGE,
        httpOnly: true,
        signed: true,
      });
      req.logger.info(
        `Documentos subidos exitosamente por el usuario id ${uid}`
      );
      res.sendSuccess(user);
    } catch (error) {
      req.logger.error(
        `Error al subir documentos del usuario ${uid}: ${error.message}`
      );
      res.sendServerError(error.message);
    }
  }

  static async changeUserRole(req, res) {
    try {
      const { uid } = req.params;
      let user = req.user;
      if (user.role !== "admin" && user._id != uid) {
        req.logger.warning(
          `El usuario id ${user._id} no puede cambiar el rol del usuario id ${uid} porque no le pertenece`
        );
        return res.sendUserError(
          `El usuario ${user._id} no puede cambiar el rol del usuario ${uid} porque no le pertenece`
        );
      }
      user = await UsersServices.getUserById(uid);
      if (!user) {
        req.logger.warning(`No existe un usuario con el id ${uid}`);
        return res.sendUserError(`No existe un usuario con el id ${uid}`);
      }
      if (user.role === "user") {
        const documents = user.documents.map((document) => document.name);
        if (
          !documents.includes("id") ||
          !documents.includes("adress") ||
          !documents.includes("account")
        ) {
          req.logger.warning(
            `No se puede cambiar el rol del usuario id ${uid} a premium porque no ha subido los documentos necesarios`
          );
          return res.sendUserError(
            `No se puede cambiar el rol del usuario id ${uid} a premium porque no ha subido los documentos necesarios`
          );
        }
      }
      user.role = user.role === "user" ? "premium" : "user";
      await UsersServices.updateUser(uid, user);
      if (req.user.role !== "admin") {
        const UserWithoutPassword = new UserWithoutPasswordDTO(user);
        req.user = { ...UserWithoutPassword };
        const token = generateToken(req.user);
        res.cookie("token", token, {
          maxAge: process.env.COOKIE_MAX_AGE,
          httpOnly: true,
          signed: true,
        });
      }
      req.logger.info(
        `Rol de usuario id ${uid} modificado exitosamente a ${user.role}`
      );
      res.sendSuccess(user);
    } catch (error) {
      req.logger.error(
        `Error al cambiar rol de usuario id ${uid}: ${error.message}`
      );
      res.sendServerError(error.message);
    }
  }

  static async deleteInactiveUsers(req, res) {
    try {
      const deletedUsers = await UsersServices.deleteInactiveUsers();
      deletedUsers.forEach(async (user) => {
        await CartsServices.deleteCart(user.cart);
        await MailingServices.getInstance().sendUserDeletedEmail(user);
      });
      req.logger.info("Usuarios inactivos eliminados exitosamente");
      res.sendSuccess(deletedUsers);
    } catch (error) {
      req.logger.error(
        `Error al eliminar usuarios inactivos: ${error.message}`
      );
      res.sendServerError(error.message);
    }
  }

  static async deleteUser(req, res) {
    try {
      const { uid } = req.params;
      const user = await UsersServices.getUserById(uid);
      if (!user) {
        req.logger.warning(`No existe un usuario con el id ${uid}`);
        return res.sendUserError(`No existe un usuario con el id ${uid}`);
      }
      const deletedUser = await UsersServices.deleteUser(uid);
      await CartsServices.deleteCart(user.cart);
      await MailingServices.getInstance().sendUserDeletedEmail(user);
      req.logger.info(`Usuario id ${uid} eliminado exitosamente`);
      res.sendSuccess(deletedUser);
    } catch (error) {
      req.logger.error(`Error al eliminar usuario id ${uid}: ${error.message}`);
      res.sendServerError(error.message);
    }
  }
}
