import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes";
import { FRONTEND_URL, PORT } from "./config/env";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: FRONTEND_URL,
  }),
);
app.use(express.json());

app.use("/api", router);

const port = Number(PORT) || 5000;
app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
