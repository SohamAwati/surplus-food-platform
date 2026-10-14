import { verifyAccessToken } from "../services/auth/token.service.js";

export function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authorization.slice("Bearer ".length);

    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      role: payload.role,
      email: payload.email,
    };

    next();

  } catch (_error) {

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
}