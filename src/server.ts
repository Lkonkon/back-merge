import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { userRoutes } from './routes/userRoutes';
import { WebSocketServer, WebSocket } from 'ws';
import { initSocket } from './socket';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

initSocket(server);

const wss = new WebSocketServer({ server: server });

wss.on('connection', (ws: WebSocket) => {
  console.log('Novo cliente conectado');

  ws.on('message', (message: string) => {
    const data = JSON.parse(message);
    if (data.type === 'player-position') {
      console.log(`Posição do jogador: ${JSON.stringify(data.position)}`);
    } else if (data.type === 'enemy-position') {
      console.log(`Posição do inimigo: ${JSON.stringify(data.position)}`);
    } else if (data.type === 'collision') {
      console.log('Colisão detectada:', JSON.stringify(data.collisionData));
      // Lógica para validar colisão
    }
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

