import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'src/database/database.module';
import { PasswordModule } from 'src/password/password.module';
import { ObservabilityModule } from 'src/shared/observability';
import { AccountInvitation } from 'src/auth/entities/account-invitation.entity';
import { User } from 'src/user/entities/user.entity';
import { AccountInvitationService } from './account-invitation.service';
import { AccountInvitationController } from './account-invitation.controller';

@Module({
  imports: [
    DatabaseModule,
    ObservabilityModule,
    PasswordModule,
    TypeOrmModule.forFeature([AccountInvitation, User]),
  ],
  controllers: [AccountInvitationController],
  providers: [AccountInvitationService],
  exports: [AccountInvitationService],
})
export class AccountInvitationModule {}
