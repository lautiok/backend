import { Server } from "socket.io";
import MessagesServices from "../services/messages.services.js";

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer);
  io.on("connection", async (socket) => {
    try {
      const messages = await MessagesServices.getMessages();
      socket.emit("loadMessages", messages);
    } catch (error) {
      socket.emit("loadMessages", []);
    }
    socket.on("saveMessage", async (user, text) => {
      try {
        await MessagesServices.addMessage(user, text);
        const messages = await MessagesServices.getMessages();
        io.emit("loadMessages", messages);
      } catch (error) {
        io.emit("loadMessages", []);
      }
    });
  });
};

export default initializeSocket;
