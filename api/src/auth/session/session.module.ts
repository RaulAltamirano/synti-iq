import { Module } from '@nestjs/common';
import { UserSessionModule } from 'src/user-session/user-session.module';
import { GuardsModule } from 'src/auth/guards/guards.module';
import { ObservabilityModule } from 'src/shared/observability';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';

@Module({
  imports: [ObservabilityModule, UserSessionModule, GuardsModule],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
