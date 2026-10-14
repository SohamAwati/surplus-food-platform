import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../services/auth/auth.service.js";

import {
  registerSchema,
  loginSchema,
} from "../validators/auth.validator.js";

export async function register(req, res, next) {
  try {
    const input = registerSchema.parse(req.body);
    const result = await registerUser(input);
    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: result,
    });

  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {

  try {
    const input = loginSchema.parse(req.body);
    const result = await loginUser(input);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });

  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.id);
    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });

  } catch (error) {
    next(error);
  }
}