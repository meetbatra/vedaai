import dotenv from "dotenv";

dotenv.config();

import mongoose from "mongoose";
import { MONGODB_URI } from "./config/env";
import "./workers/assignmentWorker";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Worker: MongoDB connected");
    console.log("Worker: Assignment worker started, waiting for jobs...");
  })
  .catch((err: unknown) => {
    console.error("Worker: MongoDB connection error:", err);
    process.exit(1);
  });
