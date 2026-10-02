import api from "./api";
import type {
  CreateTableRequest,
  Table,
  UpdateTableRequest,
} from "../types/table";

export const tableService = {
  async getTables(
    branchId?: number
  ): Promise<Table[]> {
    const response = await api.get<Table[]>(
      "/Tables",
      {
        params:
          branchId !== undefined
            ? { branchId }
            : undefined,
      }
    );

    return response.data ?? [];
  },

  async getTable(
    id: number
  ): Promise<Table> {
    const response = await api.get<Table>(
      `/Tables/${id}`
    );

    return response.data;
  },

  async createTable(
    request: CreateTableRequest
  ): Promise<Table> {
    const response =
      await api.post<Table>(
        "/Tables",
        request
      );

    return response.data;
  },

  async updateTable(
    id: number,
    request: UpdateTableRequest
  ): Promise<void> {
    await api.put(
      `/Tables/${id}`,
      request
    );
  },

  async deleteTable(
    id: number
  ): Promise<void> {
    await api.delete(
      `/Tables/${id}`
    );
  },
};