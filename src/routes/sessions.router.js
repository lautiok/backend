import CustomRouter from "./custom.router.js";
import SessionsController from "../controllers/sessions.controller.js";
import passport from "passport";
import UserWithoutPasswordDTO from "../dao/dtos/user.without.password.dto.js";

export default class SessionsRouter extends CustomRouter {
  static #instance;

  constructor() {
    super();
  }

  static getInstance() {
    if (!this.#instance) {
      this.#instance = new SessionsRouter();
    }
    return this.#instance;
  }

  init() {
    this.post(
      "/register",
      ["PUBLIC"],
      this.passportAuthentication("register"),
      SessionsController.register
    );

    this.post(
      "/login",
      ["PUBLIC"],
      this.passportAuthentication("login"),
      SessionsController.login
    );

    this.get(
      "/github",
      ["PUBLIC"],
      this.passportAuthentication("github", { scope: ["user:email"] })
    );

    this.get(
      "/githubcallback",
      ["PUBLIC"],
      this.passportAuthentication("github"),
      SessionsController.githubCallback
    );

    this.post(
      "/restore-password",
      ["PUBLIC"],
      SessionsController.restorePassword
    );

    this.post("/reset-password", ["PUBLIC"], SessionsController.resetPassword);

    this.get(
      "/current",
      ["USER", "PREMIUM", "ADMIN"],
      this.passportAuthentication("current"),
      SessionsController.current
    );

    this.post(
      "/logout",
      ["USER", "PREMIUM", "ADMIN"],
      SessionsController.logout
    );
  }

  passportAuthentication(...args) {
    return async (req, res, next) => {
      passport.authenticate(
        ...args,
        { session: false },
        (error, user, info) => {
          if (error) {
            return res.sendServerError(error.message);
          }
          if (!user) {
            return res.sendUserError(info);
          }
          const UserWithoutPassword = new UserWithoutPasswordDTO(user);
          req.user = { ...UserWithoutPassword };
          next();
        }
      )(req, res, next);
    };
  }
}
