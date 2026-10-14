import redis from "./redis.js";

try {
  const result = await redis.ping();

  console.log("Redis PING:", result);

  await redis.quit();

  process.exit(0);
} catch (error) {
  console.error("Redis test failed:", error);

  process.exit(1);
}