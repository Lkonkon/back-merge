import { Server } from "socket.io";
import { Server as HttpServer } from "http";

interface GameState {
  barrierHealth: number;
  score: number;
  money: number;
  gameTime: number;
  difficultyMultiplier: number;
  enemies: Enemy[];
  towers: Tower[];
  lastDifficultyIncrease: number;
  difficultyInterval: number;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  laneIndex: number;
}

interface Tower {
  id: number;
  x: number;
  y: number;
  level: number;
  damage: number;
  fireRate: number;
  range: number;
  cost: number;
  laneIndex: number;
}

export function initSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    transports: ["polling"],
    allowUpgrades: false,
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
    maxHttpBufferSize: 1e8,
    path: "/socket.io/",
    serveClient: false,
    cookie: false,
    perMessageDeflate: false,
  });

  const gameStates = new Map<string, GameState>();

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("join-game", (gameId: string) => {
      socket.join(gameId);
      let gameState = gameStates.get(gameId);

      if (!gameState) {
        gameState = {
          barrierHealth: 100,
          score: 0,
          money: 100,
          gameTime: 0,
          difficultyMultiplier: 1,
          enemies: [],
          towers: [],
          lastDifficultyIncrease: 0,
          difficultyInterval: 15000,
        };
        gameStates.set(gameId, gameState);

        // Start game time update for this game
        setInterval(() => {
          const state = gameStates.get(gameId);
          if (state) {
            state.gameTime++;

            // Check if it's time to increase difficulty
            if (
              state.gameTime - state.lastDifficultyIncrease >=
              state.difficultyInterval / 1000
            ) {
              state.difficultyMultiplier += 0.2;
              state.lastDifficultyIncrease = state.gameTime;
              io.to(gameId).emit(
                "difficulty-increase",
                state.difficultyMultiplier
              );
            }

            // Emit game time update
            io.to(gameId).emit("game-time-update", {
              gameTime: state.gameTime,
              difficultyMultiplier: state.difficultyMultiplier,
            });
          }
        }, 1000);
      } else {
        // Reset game state for existing game
        gameState.barrierHealth = 100;
        gameState.score = 0;
        gameState.money = 100;
        gameState.gameTime = 0;
        gameState.difficultyMultiplier = 1;
        gameState.enemies = [];
        gameState.towers = [];
        gameState.lastDifficultyIncrease = 0;
      }

      socket.emit("game-state", gameState);
    });

    socket.on(
      "spawn-enemy",
      ({ gameId, enemy }: { gameId: string; enemy: Enemy }) => {
        const gameState = gameStates.get(gameId);
        if (gameState) {
          gameState.enemies.push(enemy);
          io.to(gameId).emit("enemy-spawned", enemy);
        }
      }
    );

    socket.on(
      "enemy-damage",
      ({
        gameId,
        enemyId,
        damage,
        health,
      }: {
        gameId: string;
        enemyId: number;
        damage: number;
        health: number;
      }) => {
        const gameState = gameStates.get(gameId);
        if (gameState) {
          const enemy = gameState.enemies.find((e: Enemy) => e.id === enemyId);
          if (enemy) {
            enemy.health = health;
            io.to(gameId).emit("enemy-health-update", { enemyId, health });

            if (health <= 0) {
              gameState.enemies = gameState.enemies.filter(
                (e: Enemy) => e.id !== enemyId
              );
              gameState.score += 10;
              gameState.money += 15;
              io.to(gameId).emit("enemy-destroyed", enemyId);
              io.to(gameId).emit("game-state", gameState);
            }
          }
        }
      }
    );

    socket.on(
      "tower-placed",
      ({ gameId, tower }: { gameId: string; tower: Tower }) => {
        const gameState = gameStates.get(gameId);
        if (gameState) {
          gameState.towers.push(tower);
          gameState.money -= tower.cost;
          io.to(gameId).emit("game-state", gameState);
        }
      }
    );

    socket.on(
      "tower-move",
      ({
        gameId,
        towerId,
        x,
        y,
        laneIndex,
      }: {
        gameId: string;
        towerId: number;
        x: number;
        y: number;
        laneIndex: number;
      }) => {
        const gameState = gameStates.get(gameId);
        if (gameState) {
          const tower = gameState.towers.find((t: Tower) => t.id === towerId);
          if (tower) {
            tower.x = x;
            tower.y = y;
            tower.laneIndex = laneIndex;
            io.to(gameId).emit("tower-moved", { towerId, x, y, laneIndex });
          }
        }
      }
    );

    socket.on(
      "tower-upgrade",
      ({ gameId, towerId }: { gameId: string; towerId: number }) => {
        const gameState = gameStates.get(gameId);
        if (gameState) {
          const tower = gameState.towers.find((t: Tower) => t.id === towerId);
          if (tower) {
            tower.level++;
            tower.damage = Math.floor(tower.damage * 1.5);
            tower.fireRate = Math.max(300, tower.fireRate * 0.8);
            io.to(gameId).emit("tower-upgraded", {
              towerId,
              level: tower.level,
            });
          }
        }
      }
    );

    socket.on("debug-time", (gameId: string) => {
      const gameState = gameStates.get(gameId);
      if (gameState) {
        console.log(
          `Game time: ${
            gameState.gameTime
          }s, Difficulty: ${gameState.difficultyMultiplier.toFixed(1)}x`
        );
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  });

  return io;
}
