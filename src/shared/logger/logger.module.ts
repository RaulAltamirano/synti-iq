import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule as NestJsPinoModule } from 'nestjs-pino';
import pinoPretty from 'pino-pretty';
import { ObservabilityModule } from '../observability/observability.module';
import { ObservabilityService } from '../observability/observability.service';
import { createFilterStream } from './logger-filter.stream';

@Module({
  imports: [
    NestJsPinoModule.forRootAsync({
      imports: [ConfigModule, ObservabilityModule],
      inject: [ConfigService, ObservabilityService],
      useFactory: (config: ConfigService, observability: ObservabilityService) => {
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
            customProps: () =>
              Object.fromEntries(
                Object.entries(observability.getTraceContext()).filter(([, v]) => v != null),
              ),
          },
        };
      },
    }),
  ],
})
export class LoggerModule {}
