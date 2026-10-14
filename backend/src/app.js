import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { healthRouter } from "./routes/health.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { donorRouter } from "./routes/donor.routes.js";
import listingRoutes from "./routes/listing.routes.js";
import claimRoutes from "./routes/claim.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";
import proofRoutes from "./routes/proof.routes.js";
import impactRoutes from "./routes/impact.routes.js";
import rewardRoutes from "./routes/reward.routes.js";
import needZoneRoutes from "./routes/need-zone.routes.js";
import matchingRoutes from "./routes/matching.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Serve static frontend assets if built
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

// API Health & Root
app.get("/api", (_req, res) => {
  res.json({ 
    success: true, 
    service: "surplus-api", 
    version: "v1" 
  });
});

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/donor", donorRouter);
app.use("/api/v1/listings", listingRoutes);
app.use("/api/v1/claims", claimRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/proofs", proofRoutes);
app.use("/api/v1/impact", impactRoutes);
app.use("/api/v1/rewards", rewardRoutes);
app.use("/api/v1/need-zones", needZoneRoutes);
app.use("/api/v1/matching", matchingRoutes);
app.use("/api/v1/admin", adminRoutes);

// SPA Client-side Routing Fallback for all other non-API routes
app.use((req, res, next) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return next();
  }
  if (req.path.startsWith("/api/")) {
    return next();
  }
  const indexPath = path.join(publicDir, "index.html");
  if (fs.existsSync(indexPath)) {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    return res.sendFile(indexPath);
  }
  next();
});

app.use(errorHandler);

export default app;
