import { create } from "zustand";
import { api } from "../services/api";

const TOKEN_KEY = "surplus_access_token";
const USER_KEY = "surplus_user";

function getStoredUser() {
  try {
    const value = localStorage.getItem(USER_KEY);

    if (!value) {
      return null;
    }

    return JSON.parse(value);
  } catch {
    return null;
  }
}

export const useAuthStore = create((set) => ({
  token: localStorage.getItem(TOKEN_KEY),
  user: getStoredUser(),

  isAuthenticated: Boolean(
    localStorage.getItem(TOKEN_KEY)
  ),

  isLoading: false,
  error: null,

  register: async (registrationData) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const response = await api.post("/auth/register", registrationData);

      const token = response?.data?.token;
      const user = response?.data?.user;

      if (!token || !user) {
        throw new Error("Invalid registration response from server.");
      }

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return {
        success: true,
        user,
      };
    } catch (error) {
      set({
        isLoading: false,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  },

  login: async (email, password) => {
    set({
      isLoading: true,
      error: null,
    });

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", response);

      const token = response?.data?.token;
      const user = response?.data?.user;

      if (!token || !user) {
        throw new Error(
          "Invalid login response from server."
        );
      }

      console.log("LOGIN USER:", user);
      console.log("LOGIN USER ROLE:", user.role);

      localStorage.setItem(
        TOKEN_KEY,
        token
      );

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(user)
      );

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return {
        success: true,
        user,
      };
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      set({
        isLoading: false,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  },

  initializeAuth: async () => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      return;
    }

    set({
      isLoading: true,
    });

    try {
      const response = await api.get("/auth/me");

      console.log("AUTH ME RESPONSE:", response);

      // IMPORTANT:
      // API response is:
      // {
      //   success: true,
      //   data: {
      //     user: {...}
      //   }
      // }
      const user = response?.data?.user;

      if (!user) {
        throw new Error(
          "Invalid authentication response."
        );
      }

      console.log("AUTH ME USER:", user);
      console.log("AUTH ME ROLE:", user.role);

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(user)
      );

      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error(
        "AUTH INITIALIZATION ERROR:",
        error
      );

      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);

      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },

  clearError: () => {
    set({
      error: null,
    });
  },
}));