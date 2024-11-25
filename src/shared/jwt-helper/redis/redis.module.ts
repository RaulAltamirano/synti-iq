import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  // Método para establecer valores en Redis
  // async set(key: string, value: any, ttl: string): Promise<void> {
  //   try {
  //     // Convertir el TTL de formato legible a segundos
  //     const ttlInSeconds = parseDurationToSeconds(ttl);

  //     if (ttlInSeconds <= 0) {
  //       throw new Error(
  //         `TTL debe ser un número entero positivo. Recibido: ${ttl}`,
  //       );
  //     }

  //     const stringValue = JSON.stringify(value);
  //     await this.redisClient.set(key, stringValue, 'EX', ttlInSeconds); // Establecer el valor con TTL
  //     this.logger.log(
  //       `Guardado en Redis -> Clave: ${key}, TTL: ${ttlInSeconds} segundos`,
  //     );
  //   } catch (error) {
  //     this.logger.error(`Error al guardar la clave ${key} en Redis:`, error);
  //     throw new Error('Error al interactuar con Redis');
  //   }
  // }
  async set(key: string, value: any, ttl: number): Promise<void> {
    try {
      // Almacenamos el valor con el TTL en segundos
      const stringValue = JSON.stringify(value);
      await this.redisClient.set(key, stringValue, 'EX', ttl); // Establecer el TTL como número
      this.logger.log(
        `Guardado en Redis -> Clave: ${key}, TTL: ${ttl} segundos`,
      );
    } catch (error) {
      this.logger.error(`Error al guardar la clave ${key} en Redis:`, error);
      throw new Error('Error al interactuar con Redis');
    }
  }

  // Método para obtener un valor de Redis
  async get<T>(key: string): Promise<T> {
    try {
      const result = await this.redisClient.get(key);
      if (result) {
        return JSON.parse(result) as T;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error al obtener la clave ${key} de Redis:`, error);
      throw new Error('Error al interactuar con Redis');
    }
  }

  // Método para eliminar un valor de Redis
  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
      this.logger.log(`Eliminado de Redis -> Clave: ${key}`);
    } catch (error) {
      this.logger.error(`Error al eliminar la clave ${key} de Redis:`, error);
      throw new Error('Error al interactuar con Redis');
    }
  }
}

// Función de utilidad para convertir duración a segundos
// function parseDurationToSeconds(duration: string): number {
//   const regex = /(\d+)([smhd])/g;
//   let totalSeconds = 0;

//   let match;
//   while ((match = regex.exec(duration)) !== null) {
//     const value = parseInt(match[1], 10);
//     const unit = match[2];

//     switch (unit) {
//       case 's': // segundos
//         totalSeconds += value;
//         break;
//       case 'm': // minutos
//         totalSeconds += value * 60;
//         break;
//       case 'h': // horas
//         totalSeconds += value * 60 * 60;
//         break;
//       case 'd': // días
//         totalSeconds += value * 60 * 60 * 24;
//         break;
//       default:
//         throw new Error(`Unidad de tiempo no soportada: ${unit}`);
//     }
//   }

//   return totalSeconds;
// }
