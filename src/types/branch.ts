export interface Branch {
  id: number;
  restaurantId: number;
  restaurantName: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
  tableCount: number;
}

export interface CreateBranchRequest {
  restaurantId: number;
  name: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
}

export interface UpdateBranchRequest {
  name: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
}