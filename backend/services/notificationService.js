const { Server } = require('socket.io');

const initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000", // Your React app's URL
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Join a room based on user ID
        socket.on('join_room', (userId) => {
            socket.join(userId);
            console.log(`User ${socket.id} joined room ${userId}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
    
    return io;
};

module.exports = initializeSocket;