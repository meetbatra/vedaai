import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import mongoose from "mongoose";
import { AddressInfo } from "net";
import { QueueEvents } from "bullmq";
import { Server } from "socket.io";
import router from "./routes";
import { FRONTEND_URL, MONGODB_URI, PORT } from "./config/env";
import { bullRedisConnection } from "./lib/queue";
import Assignment from "./models/Assignment";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
const queueEvents = new QueueEvents("assignments", {
  connection: bullRedisConnection.duplicate(),
});
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("assignment:subscribe", async (assignmentId: unknown) => {
    if (typeof assignmentId !== "string" || !assignmentId.trim()) return;

    try {
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) return;

      if (assignment.status === "completed") {
        socket.emit("assignment:completed", {
          assignmentId,
          status: "completed",
          result: assignment.result,
        });
        return;
      }

      if (assignment.status === "failed") {
        socket.emit("assignment:failed", {
          assignmentId,
          status: "failed",
          error: "Assignment generation failed",
        });
        return;
      }

      socket.emit("assignment:processing", {
        assignmentId,
        status: "processing",
      });
    } catch (error: unknown) {
      console.error("Failed to handle assignment:subscribe:", error);
    }
  });
  socket.on("disconnect", () => console.log("Client disconnected:", socket.id));
});

queueEvents.on("active", async ({ jobId }) => {
  try {
    const assignment = await Assignment.findOne({ jobId: String(jobId) }).select("_id");
    if (!assignment) return;
    io.emit("assignment:processing", {
      assignmentId: assignment._id.toString(),
      status: "processing",
    });
  } catch (error: unknown) {
    console.error("Failed to emit assignment:processing from queue event:", error);
  }
});

queueEvents.on("completed", async ({ jobId }) => {
  try {
    const assignment = await Assignment.findOne({ jobId: String(jobId) });
    if (!assignment) return;
    io.emit("assignment:completed", {
      assignmentId: assignment._id.toString(),
      status: "completed",
      result: assignment.result,
    });
  } catch (error: unknown) {
    console.error("Failed to emit assignment:completed from queue event:", error);
  }
});

queueEvents.on("failed", async ({ jobId, failedReason }) => {
  try {
    const assignment = await Assignment.findOne({ jobId: String(jobId) }).select("_id");
    if (!assignment) return;
    io.emit("assignment:failed", {
      assignmentId: assignment._id.toString(),
      status: "failed",
      error: failedReason || "Unknown worker failure",
    });
  } catch (error: unknown) {
    console.error("Failed to emit assignment:failed from queue event:", error);
  }
});

// Allow all origins (CORS open for all)
app.use(cors());
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
