import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

const TOKEN_EXPIRES_IN = "1d";

export function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },

    env.JWT_SECRET,

    {
      expiresIn: TOKEN_EXPIRES_IN,
    }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(
    token,
    env.JWT_SECRET
  );
}