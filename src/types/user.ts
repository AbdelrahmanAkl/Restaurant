export type UserRole =
  | "SuperAdmin"
  | "Admin"
  | "RestaurantManager"
  | "BranchManager"
  | "Waiter"
  | "Kitchen"
  | "Cashier";

export const USER_ROLE_VALUES: Record<UserRole, number> = {
  SuperAdmin: 1,
  Admin: 2,
  RestaurantManager: 3,
  BranchManager: 4,
  Waiter: 5,
  Kitchen: 6,
  Cashier: 7,
};

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
  role: number;
  restaurantId?: number | null;
  branchId?: number | null;
  isActive: boolean;
}

export interface UpdateUserRequest {
  fullName: string;
  email: string;
  role: number;
  restaurantId?: number | null;
  branchId?: number | null;
  isActive: boolean;
}