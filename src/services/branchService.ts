import api from "./api";
import type {
  Branch,
  CreateBranchRequest,
  UpdateBranchRequest,
} from "../types/branch";

export const branchService = {
  async getBranches(): Promise<Branch[]> {
    const response = await api.get<Branch[]>("/Branches");

    return response.data ?? [];
  },

  async getBranch(id: number): Promise<Branch> {
    const response = await api.get<Branch>(`/Branches/${id}`);

    return response.data;
  },

  async createBranch(
    request: CreateBranchRequest
  ): Promise<Branch> {
    const response = await api.post<Branch>(
      "/Branches",
      request
    );

    return response.data;
  },

  async updateBranch(
    id: number,
    request: UpdateBranchRequest
  ): Promise<void> {
    await api.put(`/Branches/${id}`, request);
  },

  async deleteBranch(id: number): Promise<void> {
    await api.delete(`/Branches/${id}`);
  },
};