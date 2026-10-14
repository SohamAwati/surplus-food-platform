import "dotenv/config";
import http from "http";
import app from "./app.js";
import "./workers/index.js";
import { initializeSocket } from "./config/socket.js";

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);
initializeSocket(server);

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`[Server Error] Port ${PORT} is already in use. Run 'lsof -ti :${PORT} | xargs kill -9' to free it.`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, () => {
  console.log(`Surplus API running on http://localhost:${PORT}`);
});
