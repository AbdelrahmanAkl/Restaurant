export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  restaurantId?: number | null;
  branchId?: number | null;
}

export interface AuthResponse {
  userId: number;
  fullName: string;
  email: string;
  role: string;
  restaurantId?: number | null;
  branchId?: number | null;
  token: string;
}