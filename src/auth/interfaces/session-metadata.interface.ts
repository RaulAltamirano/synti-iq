export interface SessionMetadata {
  deviceInfo?: {
    deviceType: string;
    deviceName: string | null;
    browser: string | undefined;
    browserVersion: string | undefined;
    os: string | undefined;
    osVersion: string | undefined;
    userAgent: string | null;
    ipAddress: string | null;
  };
  lastUsed: Date;
}
