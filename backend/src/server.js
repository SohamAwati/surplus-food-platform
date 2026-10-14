import "dotenv/config";
import http from "http";
import app from "./app.js";
import "./workers/index.js";
import { initializeSocket } from "./config/socket.js";

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Surplus API running on http://localhost:${PORT}`);
});
