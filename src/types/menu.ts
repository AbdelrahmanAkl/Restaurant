export interface Category {
  id: number;
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string | null;
  isActive: boolean;
}

export interface CreateMenuItemRequest {
  categoryId: number;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
}

export interface UpdateMenuItemRequest {
  categoryId: number;
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  isAvailable: boolean;
}
