import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule as NestJsPinoModule } from 'nestjs-pino';
import pinoPretty from 'pino-pretty';
import { createFilterStream } from './logger-filter.stream';

@Module({
  imports: [
    NestJsPinoModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get('NODE_ENV') === 'production';
        const level = config.get('LOG_LEVEL', isProd ? 'info' : 'debug');
        const usePretty = !isProd && config.get('LOG_PRETTY', 'true').toLowerCase() === 'true';

        let dest: NodeJS.WritableStream = process.stdout;
        if (usePretty) {
          const pretty = pinoPretty({ colorize: true });
          pretty.pipe(process.stdout);
          dest = pretty;
        }

        return {
          pinoHttp: {
            level,
            stream: createFilterStream(dest),
            genReqId: req => {
              const id = req.headers?.['x-request-id'];
              return (Array.isArray(id) ? id[0] : id) ?? crypto.randomUUID();
            },
            redact: {
              paths: [
                'req.headers.cookie',
                'req.headers.authorization',
                'res.headers["set-cookie"]',
              ],
              censor: '[REDACTED]',
            },
          },
        };
      },
    }),
  ],
})
export class LoggerModule {}
