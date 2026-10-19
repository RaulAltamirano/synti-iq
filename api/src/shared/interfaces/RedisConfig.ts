export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  retryStrategy?: (times: number) => number | void;
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  reconnectOnError?: (err: Error) => boolean | 1 | 2;
}
