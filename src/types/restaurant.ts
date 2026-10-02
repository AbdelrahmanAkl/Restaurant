export interface Restaurant {
  id: number;
  name: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
  createdAt: string;
  branchCount: number;
}

export interface CreateRestaurantRequest {
  name: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
}

export interface UpdateRestaurantRequest {
  name: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  isActive: boolean;
}