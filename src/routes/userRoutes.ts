import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();
const prisma = new PrismaClient();

// Criar ou buscar usuário
router.post("/users", async (req, res) => {
  const { name } = req.body;
  console.log("Received request body:", req.body); // Debug log

  if (!name) {
    return res.status(400).json({ error: "Nome é obrigatório" });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { name },
    });

    if (!user) {
      user = await prisma.user.create({
        data: { name },
      });
    }

    console.log("User found/created:", user); // Debug log

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || "", {
      expiresIn: "7d",
    });

    const response = {
      user,
      token,
    };
    console.log("Sending response:", response); // Debug log
    return res.json(response);
  } catch (error) {
    console.error("Database error:", error);
    return res.status(400).json({
      error: "Erro ao criar/buscar usuário",
      details: error.message,
    });
  }
});

// Rota de teste autenticada
router.get("/test", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    return res.json({ userId: user.id });
  } catch (error) {
    return res.status(400).json({ error: "Erro ao buscar usuário" });
  }
});

export const userRoutes = router;
