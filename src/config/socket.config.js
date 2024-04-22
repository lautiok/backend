import { Server } from 'socket.io';
import MessagesRepository from '../repositories/messages.repository.js';

const initializeSocket = (httpServer) => {
    const io = new Server(httpServer);
    io.on('connection', async (socket) => {
        try {
            const messages = await MessagesRepository.getInstance().getMessages();
            socket.emit('loadMessages', messages);
        } catch (error) {
            socket.emit('loadMessages', []);
        }

        socket.on('saveMessage', async (user, text) => {
            try {
                await MessagesRepository.getInstance().addMessage(user, text);
                const messages = await MessagesRepository.getInstance().getMessages();
                io.emit('loadMessages', messages);
            } catch (error) {
                io.emit('loadMessages', []);
            }
        });
    });
}

export default initializeSocket;