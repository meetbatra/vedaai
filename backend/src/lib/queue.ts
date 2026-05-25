import { Queue } from "bullmq";
import IORedis from "ioredis";
import { BULLMQ_REDIS_URL, UPSTASH_REDIS_URL } from "../config/env";
import { redis } from "./redis";

void redis;

const resolveBullMqRedisUrl = (): string => {
  const candidate = BULLMQ_REDIS_URL || UPSTASH_REDIS_URL;

  if (!candidate) {
    throw new Error(
      "Missing Redis URL for BullMQ. Set BULLMQ_REDIS_URL to a redis:// or rediss:// URL.",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error(
      "Invalid Redis URL for BullMQ. Use a valid redis:// or rediss:// URL in BULLMQ_REDIS_URL.",
    );
  }

  if (parsed.protocol !== "redis:" && parsed.protocol !== "rediss:") {
    throw new Error(
      "BullMQ requires TCP Redis URL (redis:// or rediss://). Your current value is REST/HTTP. Set BULLMQ_REDIS_URL to the Upstash Redis endpoint URL.",
    );
  }

  return candidate;
};

const bullMqRedisUrl = resolveBullMqRedisUrl();

export const bullRedisConnection = new IORedis(bullMqRedisUrl, {
  tls: { rejectUnauthorized: false },
  maxRetriesPerRequest: null,
});

export const assignmentQueue = new Queue("assignments", {
  connection: bullRedisConnection,
});
