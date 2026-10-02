export interface Table {
  id: number;
  branchId: number;
  branchName: string;
  tableNumber: string;
  qrCode?: string | null;
  isActive: boolean;
}

export interface CreateTableRequest {
  branchId: number;
  tableNumber: string;
  isActive: boolean;
}

export interface UpdateTableRequest {
  tableNumber: string;
  isActive: boolean;
}