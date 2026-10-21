export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  message?: string;
}
export interface ApiError extends Error {
  status?: number;
  code?: string;
  data?: unknown;
}

export interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}
