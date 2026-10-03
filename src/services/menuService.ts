import api from "./api";
import type {
  Category,
  CreateCategoryRequest,
  CreateMenuItemRequest,
  MenuItem,
  UpdateCategoryRequest,
  UpdateMenuItemRequest,
} from "../types/menu";

export const menuService = {
  async getCategories(restaurantId?: number): Promise<Category[]> {
    const response = await api.get<Category[]>(
      "/admin/menu/categories",
      {
        params: restaurantId
          ? { restaurantId }
          : undefined,
      }
    );

    return response.data ?? [];
  },

  async getCategory(id: number): Promise<Category> {
    const response = await api.get<Category>(
      `/admin/menu/categories/${id}`
    );

    return response.data;
  },

  async createCategory(
    request: CreateCategoryRequest,
    restaurantId?: number
  ): Promise<Category> {
    const response = await api.post<Category>(
      "/admin/menu/categories",
      request,
      {
        params: restaurantId
          ? { restaurantId }
          : undefined,
      }
    );

    return response.data;
  },

  async updateCategory(
    id: number,
    request: UpdateCategoryRequest
  ): Promise<void> {
    await api.put(
      `/admin/menu/categories/${id}`,
      request
    );
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(
      `/admin/menu/categories/${id}`
    );
  },

  async getMenuItems(
    restaurantId?: number,
    categoryId?: number
  ): Promise<MenuItem[]> {
    const response = await api.get<MenuItem[]>(
      "/admin/menu/items",
      {
        params: {
          ...(restaurantId ? { restaurantId } : {}),
          ...(categoryId ? { categoryId } : {}),
        },
      }
    );

    return response.data ?? [];
  },

  async getMenuItem(id: number): Promise<MenuItem> {
    const response = await api.get<MenuItem>(
      `/admin/menu/items/${id}`
    );

    return response.data;
  },

  async createMenuItem(
    request: CreateMenuItemRequest
  ): Promise<MenuItem> {
    const response = await api.post<MenuItem>(
      "/admin/menu/items",
      request
    );

    return response.data;
  },

  async updateMenuItem(
    id: number,
    request: UpdateMenuItemRequest
  ): Promise<void> {
    await api.put(
      `/admin/menu/items/${id}`,
      request
    );
  },

  async deleteMenuItem(id: number): Promise<void> {
    await api.delete(
      `/admin/menu/items/${id}`
    );
  },
};
