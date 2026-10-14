import { Server } from "socket.io";
import { verifyAccessToken } from "../services/auth/token.service.js";

let io;

export function initializeSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      methods: ["GET", "POST"]
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }
    try {
      const decoded = verifyAccessToken(token);
      socket.user = {
        id: decoded.sub,
        role: decoded.role,
        email: decoded.email
      };
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected to socket: ${socket.user?.id}`);
    
    // Join user-specific room
    if (socket.user?.id) {
      socket.join(`user_${socket.user.id}`);
    }
    
    // Join role-specific room
    if (socket.user?.role) {
      socket.join(`role_${socket.user.role}`);
    }

    socket.on("disconnect", () => {
      console.log(`User disconnected from socket: ${socket.user?.id}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

export function sendNotificationToUser(userId, event, payload) {
  if (io) {
    io.to(`user_${userId}`).emit(event, payload);
  }
}

export function broadcastToRole(role, event, payload) {
  if (io) {
    io.to(`role_${role}`).emit(event, payload);
  }
}
