import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "DATABASE_URL",
  "REDIS_URL",
  "JWT_SECRET",
];

for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    console.warn(`[Config] Notice: Environment variable ${key} is not set; using fallback if available.`);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",

  PORT: Number(process.env.PORT || 5001),

  DATABASE_URL:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/surplus_db?schema=public",

  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",

  FRONTEND_URL:
    process.env.FRONTEND_URL ||
    "http://localhost:5173",

  JWT_SECRET: process.env.JWT_SECRET || "surplus-production-jwt-secret-key-9988",

  SLA_DURATION_MINUTES: Number(process.env.SLA_DURATION_MINUTES || 60),
  SLA_WARNING_MINUTES: Number(process.env.SLA_WARNING_MINUTES || 15),
};