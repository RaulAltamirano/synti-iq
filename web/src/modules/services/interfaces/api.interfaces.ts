export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}
export interface ApiError extends Error {
  status?: number;
  code?: string;
  data?: any;
}

export interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}
