import api from "./api";
import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
} from "../types/auth";

const TOKEN_KEY = "token";
const USER_KEY = "user";

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log("LOGIN REQUEST:", {
      email: credentials.email,
      passwordLength: credentials.password.length,
    });

    console.log("API URL:", import.meta.env.VITE_API_URL);

    const response = await api.post<AuthResponse>(
      "/Auth/login",
      {
        email: credentials.email.trim(),
        password: credentials.password,
      }
    );

    console.log("LOGIN RESPONSE:", response.data);

    const data = response.data;

    localStorage.setItem(TOKEN_KEY, data.token);

    const user: AuthUser = {
      userId: data.userId,
      fullName: data.fullName,
      email: data.email,
      role: data.role,
      restaurantId: data.restaurantId ?? null,
      branchId: data.branchId ?? null,
    };

    localStorage.setItem(USER_KEY, JSON.stringify(user));

    return data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = "/login";
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): AuthUser | null {
    const user = localStorage.getItem(USER_KEY);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as AuthUser;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  },
};