import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000', {
  reconnection: true,
  reconnectionAttempts: 5,
});

export default socket;