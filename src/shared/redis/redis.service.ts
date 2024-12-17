import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { RedisConfig } from '../interfaces/RedisConfig';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: Redis;
  private readonly DEFAULT_TTL = 3600;
  private readonly MAX_RETRY_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 1000;

  constructor(private readonly configService: ConfigService) {
    const redisConfig: RedisConfig = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 0),
      keyPrefix: this.configService.get<string>('REDIS_PREFIX', 'app:'),
      maxRetriesPerRequest: this.MAX_RETRY_ATTEMPTS,
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        if (times > this.MAX_RETRY_ATTEMPTS) {
          this.logger.error('Max retry attempts reached');
          return null;
        }
        return Math.min(times * this.RETRY_DELAY, 5000);
      },
      reconnectOnError: (err: Error) => {
        this.logger.warn('Redis connection error:', err);
        return true;
      },
    };

    this.initializeRedisClient(redisConfig);
  }

  private initializeRedisClient(config: RedisConfig): void {
    this.redisClient = new Redis(config);

    this.redisClient.on('error', (err) => {
      this.logger.error('Redis Client Error:', err);
    });

    this.redisClient.on('connect', () => {
      this.logger.log('Successfully connected to Redis');
    });

    this.redisClient.on('ready', () => {
      this.logger.log('Redis Client Ready');
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.redisClient.ping();
      this.logger.log('Redis connection verified');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.redisClient.quit();
    this.logger.log('Redis connection closed');
  }

  /**
   * Guarda un valor en Redis con TTL opcional
   */
  async set(
    key: string,
    value: any,
    ttl: number = this.DEFAULT_TTL,
  ): Promise<void> {
    try {
      const stringValue = this.serialize(value);
      await this.redisClient.set(key, stringValue, 'EX', ttl);
      this.logger.debug(`Valor guardado para la clave: ${key}`);
    } catch (error) {
      this.logger.error(`Error al guardar la clave ${key} en Redis:`, error);
      throw new Error(`Error al guardar en Redis: ${error.message}`);
    }
  }

  /**
   * Obtiene un valor de Redis con tipado genérico
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.redisClient.get(key);
      if (!result) return null;
      return this.deserialize<T>(result);
    } catch (error) {
      this.logger.error(`Error al obtener la clave ${key} de Redis:`, error);
      throw new Error(`Error al obtener de Redis: ${error.message}`);
    }
  }

  /**
   * Elimina una o varias claves de Redis
   */
  async del(...keys: string[]): Promise<void> {
    try {
      await this.redisClient.del(...keys);
      this.logger.debug(`Claves eliminadas: ${keys.join(', ')}`);
    } catch (error) {
      this.logger.error(
        `Error al eliminar las claves ${keys.join(', ')} de Redis:`,
        error,
      );
      throw new Error(`Error al eliminar de Redis: ${error.message}`);
    }
  }

  /**
   * Incrementa un contador
   */
  async incr(key: string): Promise<number> {
    try {
      return await this.redisClient.incr(key);
    } catch (error) {
      this.logger.error(`Error al incrementar la clave ${key}:`, error);
      throw new Error(`Error al incrementar contador: ${error.message}`);
    }
  }

  /**
   * Establece un tiempo de expiración para una clave
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      return (await this.redisClient.expire(key, seconds)) === 1;
    } catch (error) {
      this.logger.error(`Error al establecer expiración para ${key}:`, error);
      throw new Error(`Error al establecer expiración: ${error.message}`);
    }
  }

  /**
   * Inicia una transacción multi
   */
  multi(): any {
    return this.redisClient.pipeline();
  }

  /**
   * Verifica si una clave existe
   */
  async exists(key: string): Promise<boolean> {
    try {
      return (await this.redisClient.exists(key)) === 1;
    } catch (error) {
      this.logger.error(`Error al verificar existencia de ${key}:`, error);
      throw new Error(`Error al verificar existencia: ${error.message}`);
    }
  }

  /**
   * Obtiene el TTL restante de una clave
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.redisClient.ttl(key);
    } catch (error) {
      this.logger.error(`Error al obtener TTL de ${key}:`, error);
      throw new Error(`Error al obtener TTL: ${error.message}`);
    }
  }

  /**
   * Serializa valores para almacenamiento
   */
  private serialize(value: any): string {
    try {
      return JSON.stringify(value);
    } catch (error) {
      this.logger.error('Error al serializar valor:', error);
      throw new Error(`Error de serialización: ${error.message}`);
    }
  }

  /**
   * Deserializa valores almacenados
   */
  private deserialize<T>(value: string): T {
    try {
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error('Error al deserializar valor:', error);
      throw new Error(`Error de deserialización: ${error.message}`);
    }
  }

  /**
   * Limpia todas las claves que coincidan con un patrón
   */
  async cleanPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redisClient.keys(pattern);
      if (keys.length > 0) {
        await this.redisClient.del(...keys);
        this.logger.debug(
          `Limpiadas ${keys.length} claves con patrón: ${pattern}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error al limpiar claves con patrón ${pattern}:`,
        error,
      );
      throw new Error(`Error al limpiar claves: ${error.message}`);
    }
  }

  /**
   * Obtiene el cliente Redis subyacente
   */
  getClient(): Redis {
    return this.redisClient;
  }
}
