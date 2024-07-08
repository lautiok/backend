import TicketsServices from "../services/tickets.services.js";

export default class TicketsController {
  static async deleteTickets(req, res) {
    try {
      const deletedTickets = await TicketsServices.deleteTickets();
      req.logger.info("Tickets eliminados exitosamente");
      res.sendSuccess(deletedTickets);
    } catch (error) {
      req.logger.error(`Error al eliminar tickets: ${error.message}`);
      res.sendServerError(error.message);
    }
  }
}
