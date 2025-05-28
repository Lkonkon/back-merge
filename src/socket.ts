import { Server } from 'socket.io';

let io: Server | null = null;
export function initSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('a user connected ' + socket.id);

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on('message', (data) => {
      console.log('message from client: ', data);
    });

    socket.on('player-position', (data) => {
      console.log('player: ', data);
    });
  });
} 