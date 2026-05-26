import { Redis } from "@upstash/redis";
import { UPSTASH_REDIS_TOKEN, UPSTASH_REDIS_URL } from "../config/env";

export const redis = new Redis({
  url: UPSTASH_REDIS_URL,
  token: UPSTASH_REDIS_TOKEN,
});
