import options from "./args.config.js";
import dotenv from "dotenv";

const environment = options.environment;
dotenv.config({
  path: environment === "development" ? "./.env.dev" : "./.env.prod",
});
