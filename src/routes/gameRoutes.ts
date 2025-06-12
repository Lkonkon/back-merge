import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// Iniciar novo jogo
router.post("/games", authMiddleware, async (req, res) => {
  try {
    const game = await prisma.game.create({
      data: {
        userId: req.userId,
      },
    });
    return res.json(game);
  } catch (error) {
    console.error("Error creating game:", error);
    return res.status(400).json({ error: "Erro ao criar jogo" });
  }
});

// Criar torre
router.post("/games/:gameId/towers", authMiddleware, async (req, res) => {
  const { gameId } = req.params;
  const { type, x, y } = req.body;

  try {
    const tower = await prisma.tower.create({
      data: {
        gameId: parseInt(gameId),
        type,
        x,
        y,
      },
    });
    return res.json(tower);
  } catch (error) {
    console.error("Error creating tower:", error);
    return res.status(400).json({ error: "Erro ao criar torre" });
  }
});

// Criar inimigo
router.post("/games/:gameId/enemies", authMiddleware, async (req, res) => {
  const { gameId } = req.params;
  const { type, x, y } = req.body;

  try {
    const enemy = await prisma.enemy.create({
      data: {
        gameId: parseInt(gameId),
        type,
        x,
        y,
      },
    });
    return res.json(enemy);
  } catch (error) {
    console.error("Error creating enemy:", error);
    return res.status(400).json({ error: "Erro ao criar inimigo" });
  }
});

// Criar bala
router.post("/games/:gameId/bullets", authMiddleware, async (req, res) => {
  const { gameId } = req.params;
  const { towerId, x, y, targetX, targetY } = req.body;

  try {
    const bullet = await prisma.bullet.create({
      data: {
        gameId: parseInt(gameId),
        towerId,
        x,
        y,
        targetX,
        targetY,
      },
    });
    return res.json(bullet);
  } catch (error) {
    console.error("Error creating bullet:", error);
    return res.status(400).json({ error: "Erro ao criar bala" });
  }
});

// Atualizar posição do inimigo
router.patch(
  "/games/:gameId/enemies/:enemyId",
  authMiddleware,
  async (req, res) => {
    const { gameId, enemyId } = req.params;
    const { x, y, health } = req.body;

    try {
      const enemy = await prisma.enemy.update({
        where: {
          id: parseInt(enemyId),
          gameId: parseInt(gameId),
        },
        data: {
          x,
          y,
          health,
        },
      });
      return res.json(enemy);
    } catch (error) {
      console.error("Error updating enemy:", error);
      return res.status(400).json({ error: "Erro ao atualizar inimigo" });
    }
  }
);

// Atualizar posição da bala
router.patch(
  "/games/:gameId/bullets/:bulletId",
  authMiddleware,
  async (req, res) => {
    const { gameId, bulletId } = req.params;
    const { x, y } = req.body;

    try {
      const bullet = await prisma.bullet.update({
        where: {
          id: parseInt(bulletId),
          gameId: parseInt(gameId),
        },
        data: {
          x,
          y,
        },
      });
      return res.json(bullet);
    } catch (error) {
      console.error("Error updating bullet:", error);
      return res.status(400).json({ error: "Erro ao atualizar bala" });
    }
  }
);

// Obter estado do jogo
router.get("/games/:gameId", authMiddleware, async (req, res) => {
  const { gameId } = req.params;

  try {
    const game = await prisma.game.findUnique({
      where: {
        id: parseInt(gameId),
      },
      include: {
        towers: true,
        enemies: true,
        bullets: true,
      },
    });

    if (!game) {
      return res.status(404).json({ error: "Jogo não encontrado" });
    }

    return res.json(game);
  } catch (error) {
    console.error("Error getting game state:", error);
    return res.status(400).json({ error: "Erro ao obter estado do jogo" });
  }
});

// Realocar torre
router.patch(
  "/games/:gameId/towers/:towerId",
  authMiddleware,
  async (req, res) => {
    const { gameId, towerId } = req.params;
    const { x, y } = req.body;

    try {
      // Verifica se a torre pertence ao jogo
      const tower = await prisma.tower.findFirst({
        where: {
          id: parseInt(towerId),
          gameId: parseInt(gameId),
        },
      });

      if (!tower) {
        return res.status(404).json({ error: "Torre não encontrada" });
      }

      // Atualiza a posição da torre
      const updatedTower = await prisma.tower.update({
        where: {
          id: parseInt(towerId),
        },
        data: {
          x,
          y,
        },
      });

      return res.json(updatedTower);
    } catch (error) {
      console.error("Error relocating tower:", error);
      return res.status(400).json({
        error: "Erro ao realocar torre",
        details: error instanceof Error ? error.message : "Erro desconhecido",
      });
    }
  }
);

// Obter todas as torres de um jogo
router.get("/games/:gameId/towers", authMiddleware, async (req, res) => {
  const { gameId } = req.params;

  try {
    const towers = await prisma.tower.findMany({
      where: {
        gameId: parseInt(gameId),
      },
    });

    return res.json(towers);
  } catch (error) {
    console.error("Error getting towers:", error);
    return res.status(400).json({
      error: "Erro ao buscar torres",
      details: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
});

export const gameRoutes = router;
