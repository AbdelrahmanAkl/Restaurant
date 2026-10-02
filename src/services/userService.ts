import api from "./api";

import type {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserRole,
} from "../types/user";

import { USER_ROLE_VALUES } from "../types/user";

export const userService = {
  async getUsers(): Promise<User[]> {
    const response =
      await api.get<User[]>("/Users");

    return response.data ?? [];
  },

  async getUser(id: number): Promise<User> {
    const response =
      await api.get<User>(`/Users/${id}`);

    return response.data;
  },

  async createUser(
    request: CreateUserRequest
  ): Promise<User> {
    const response =
      await api.post<User>(
        "/Users",
        request
      );

    return response.data;
  },

  async updateUser(
    id: number,
    request: UpdateUserRequest
  ): Promise<User> {
    const response =
      await api.put<User>(
        `/Users/${id}`,
        request
      );

    return response.data;
  },

  async changeRole(
    id: number,
    role: UserRole
  ): Promise<void> {
    await api.put(
      `/Users/${id}/role`,
      USER_ROLE_VALUES[role]
    );
  },

  async changeStatus(
    id: number,
    isActive: boolean
  ): Promise<void> {
    await api.put(
      `/Users/${id}/status`,
      isActive
    );
  },

  async deleteUser(
    id: number
  ): Promise<void> {
    await api.delete(
      `/Users/${id}`
    );
  },
};