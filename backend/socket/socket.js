module.exports = (server) => {
  const io = require('socket.io')(server, {
    cors: {
      origin: 'http://localhost:5173', // Allow connections from Vite dev server
      methods: ['GET', 'POST'],
      credentials: true
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
  });

  return io;
};