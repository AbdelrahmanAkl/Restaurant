export type UserRole =
  | "SuperAdmin"
  | "Admin"
  | "RestaurantManager"
  | "BranchManager"
  | "Waiter"
  | "Kitchen"
  | "Cashier";

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  restaurantId?: number | null;
  restaurantName?: string | null;
  branchId?: number | null;
  branchName?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  restaurantId?: number | null;
  branchId?: number | null;
  isActive: boolean;
}

export interface UpdateUserRequest {
  fullName: string;
  email: string;
  role: UserRole;
  restaurantId?: number | null;
  branchId?: number | null;
  isActive: boolean;
}
