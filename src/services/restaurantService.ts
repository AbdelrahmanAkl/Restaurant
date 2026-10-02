import api from "./api";

import type {
  CreateRestaurantRequest,
  Restaurant,
  UpdateRestaurantRequest,
} from "../types/restaurant";

export const restaurantService = {
  async getRestaurants(): Promise<Restaurant[]> {
    const response =
      await api.get<Restaurant[]>(
        "/Restaurants"
      );

    return response.data ?? [];
  },

  async getRestaurant(
    id: number
  ): Promise<Restaurant> {
    const response =
      await api.get<Restaurant>(
        `/Restaurants/${id}`
      );

    return response.data;
  },

  async createRestaurant(
    request: CreateRestaurantRequest
  ): Promise<Restaurant> {
    const response =
      await api.post<Restaurant>(
        "/Restaurants",
        request
      );

    return response.data;
  },

  async updateRestaurant(
    id: number,
    request: UpdateRestaurantRequest
  ): Promise<void> {
    await api.put(
      `/Restaurants/${id}`,
      request
    );
  },

  async deleteRestaurant(
    id: number
  ): Promise<void> {
    await api.delete(
      `/Restaurants/${id}`
    );
  },
};