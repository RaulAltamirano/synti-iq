export interface DeviceInfo {
  deviceType?: string;
  deviceName?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  userAgent?: string;
  ipAddress?: string;
  location?: string;
}

export interface ActiveUserSession {
  id: string;
  userId: string;
  sessionId: string;
  deviceInfo?: DeviceInfo;
  userAgent?: string;
  ipAddress?: string;
  lastUsed: Date;
  isValid: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedSessionsResponse {
  items: ActiveUserSession[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
