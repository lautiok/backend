import CustomRouter from "./custom.router.js";
import TicketsController from "../controllers/tickets.contoller.js";

export default class TicketsRouter extends CustomRouter {
  static #instance;

  constructor() {
    super();
  }

  static getInstance() {
    if (!this.#instance) {
      this.#instance = new TicketsRouter();
    }
    return this.#instance;
  }

  init() {
    this.delete("/", ["ADMIN"], TicketsController.deleteTickets);
  }
}
