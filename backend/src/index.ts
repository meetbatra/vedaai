import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import mongoose from "mongoose";
import { AddressInfo } from "net";
import { Server } from "socket.io";
import router from "./routes";
import { FRONTEND_URL, MONGODB_URI, PORT } from "./config/env";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

app.use(
  cors({
    origin: FRONTEND_URL,
  }),
);
app.use(express.json());

app.use("/api", router);

const port = Number(PORT) || 5000;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    httpServer
      .listen(port, () => {
        const address = httpServer.address() as AddressInfo | null;
        const listeningPort = address?.port ?? port;
        console.log(`Backend running on port ${listeningPort}`);
      })
      .on("error", (error: NodeJS.ErrnoException) => {
        if (error.code === "EADDRINUSE") {
          console.error(`Port ${port} is already in use. Stop the other process or use another PORT.`);
          process.exit(1);
        }
        console.error("HTTP server error:", error);
        process.exit(1);
      });
  })
  .catch((err: unknown) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

export { io };
