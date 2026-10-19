import { DynamicModule, FactoryProvider, Module } from '@nestjs/common';
import { MailService, MAIL_OPTIONS, MailServiceOptions } from './mail.service';
import { MailController } from './mail.controller';

export interface MailModuleAsyncOptions {
  imports?: DynamicModule['imports'];
  inject?: FactoryProvider['inject'];
  useFactory: (...args: unknown[]) => MailServiceOptions | Promise<MailServiceOptions>;
}

@Module({})
export class MailModule {
  static forRootAsync(options: MailModuleAsyncOptions): DynamicModule {
    return {
      module: MailModule,
      global: true,
      imports: (options.imports ?? []) as DynamicModule['imports'],
      controllers: [MailController],
      providers: [
        {
          provide: MAIL_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        MailService,
      ],
      exports: [MailService],
    };
  }
}
