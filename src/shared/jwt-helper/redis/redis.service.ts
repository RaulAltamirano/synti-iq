import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { RedisService } from './redis.module';

@Global() // Hacemos el módulo global para evitar tener que importarlo en otros módulos
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const redisClient = createClient({
          url: configService.get<string>('REDIS_URL'),
        });

        redisClient.on('error', (err) =>
          console.error('Redis Client Error', err),
        );

        await redisClient.connect(); // Establece la conexión

        return redisClient;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService], // Exportamos el cliente y el servicio para uso en otros módulos
})
export class RedisModule {}
