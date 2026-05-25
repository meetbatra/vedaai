import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || "5000";
export const MONGODB_URI = process.env.MONGODB_URI || "";
export const UPSTASH_REDIS_URL = process.env.UPSTASH_REDIS_URL || "";
export const UPSTASH_REDIS_TOKEN = process.env.UPSTASH_REDIS_TOKEN || "";
export const BULLMQ_REDIS_URL = process.env.BULLMQ_REDIS_URL || "";
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

if (!MONGODB_URI) {
  throw new Error("Missing required environment variable: MONGODB_URI");
}

if (!OPENAI_API_KEY) {
  throw new Error("Missing required environment variable: OPENAI_API_KEY");
}

if (!UPSTASH_REDIS_URL) {
  throw new Error("Missing required environment variable: UPSTASH_REDIS_URL");
}

if (!UPSTASH_REDIS_TOKEN) {
  throw new Error("Missing required environment variable: UPSTASH_REDIS_TOKEN");
}
