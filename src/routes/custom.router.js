import { Router } from "express";
import { validateToken } from "../utils/tokens.utils.js";

export default class CustomRouter {
  constructor() {
    this.router = Router();
    this.router.use(this.generateCustomResponses);
    this.init();
  }

  getRouter() {
    return this.router;
  }

  init() {}

  get(path, policies, ...callbacks) {
    this.router.get(
      path,
      this.handlePolicies(policies),
      this.applyCallbacks(callbacks)
    );
  }

  post(path, policies, ...callbacks) {
    this.router.post(
      path,
      this.handlePolicies(policies),
      this.applyCallbacks(callbacks)
    );
  }

  put(path, policies, ...callbacks) {
    this.router.put(
      path,
      this.handlePolicies(policies),
      this.applyCallbacks(callbacks)
    );
  }

  delete(path, policies, ...callbacks) {
    this.router.delete(
      path,
      this.handlePolicies(policies),
      this.applyCallbacks(callbacks)
    );
  }

  handlePolicies(policies) {
    return (req, res, next) => {
      if (policies.includes("ALL")) {
        return next();
      }
      if (req.originalUrl.startsWith("/api/docs")) {
        return next();
      }
      const token = req.signedCookies.token;
      const user = validateToken(token);
      req.user = user;

      if (!req.originalUrl.startsWith("/api")) {
        if (token) {
          if (
            user.role === "user" &&
            (policies.includes("PUBLIC") ||
              policies.includes("PREMIUM") ||
              policies.includes("ADMIN"))
          ) {
            return res.redirect("/products");
          } else if (
            user.role === "premium" &&
            (policies.includes("PUBLIC") || policies.includes("ADMIN"))
          ) {
            return res.redirect("/products");
          } else if (
            user.role === "admin" &&
            (policies.includes("PUBLIC") ||
              policies.includes("USER") ||
              policies.includes("PREMIUM"))
          ) {
            return res.redirect("/admin/main");
          }
        } else if (
          policies.includes("USER") ||
          policies.includes("PREMIUM") ||
          policies.includes("ADMIN")
        ) {
          return res.redirect("/");
        }
        return next();
      }
      if (policies.includes("PUBLIC") && !token) {
        return next();
      }
      if (!token) {
        req.logger.warning("Debes iniciar sesión para realizar esta acción");
        return res
          .status(401)
          .json({
            status: "error",
            message: "Debes iniciar sesión para realizar esta acción",
          });
      }
      if (!user) {
        req.logger.warning("Token inválido");
        return res
          .status(401)
          .json({ status: "error", message: "Token inválido" });
      }
      // Si el usuario no tiene permisos, se devuelve un error
      if (!policies.includes(user.role.toUpperCase())) {
        req.logger.warning("No tienes permisos para realizar esta acción");
        return res
          .status(403)
          .json({
            status: "error",
            message: "No tienes permisos para realizar esta acción",
          });
      }
      next();
    };
  }

  generateCustomResponses(req, res, next) {
    res.sendSuccess = (payload) =>
      res.status(200).json({ status: "success", payload });
    res.sendUserError = (error) =>
      res.status(400).json({ status: "error", message: error });
    res.sendServerError = (error) =>
      res.status(500).json({ status: "error", message: error });
    next();
  }

  applyCallbacks(callbacks) {
    return callbacks.map((callback) => async (...params) => {
      try {
        await callback.apply(this, params);
      } catch (error) {
        params[1].sendServerError(error.message);
      }
    });
  }
}
