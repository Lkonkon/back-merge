import express from "express";
import { createServer } from "http";
import cors from "cors";
import dotenv from "dotenv";
import { userRoutes } from "./routes/userRoutes";
import { gameRoutes } from "./routes/gameRoutes";
import { initSocket } from "./socket";

dotenv.config();

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);
app.use("/api", gameRoutes);

const PORT = process.env.PORT || 3000;

// Initialize Socket.IO
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
