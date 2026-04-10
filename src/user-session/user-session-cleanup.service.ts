import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserSessionService } from './user-session.service';
import { SESSION_EXPIRATION_DAYS_DEFAULT } from './constants/user-session-cache.constants';

@Injectable()
export class UserSessionCleanupService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(UserSessionCleanupService.name);
  private readonly expirationDays: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly userSessionService: UserSessionService,
    private readonly configService: ConfigService,
  ) {
    this.expirationDays = this.configService.get<number>(
      'SESSION_EXPIRATION_DAYS',
      SESSION_EXPIRATION_DAYS_DEFAULT,
    );
  }

  onModuleInit() {
    const now = new Date();
    const nextCleanup = new Date();
    nextCleanup.setHours(2, 0, 0, 0);
    if (nextCleanup <= now) {
      nextCleanup.setDate(nextCleanup.getDate() + 1);
    }
    const msUntilCleanup = nextCleanup.getTime() - now.getTime();

    setTimeout(() => {
      this.handleSessionCleanup();
      this.cleanupInterval = setInterval(
        () => {
          this.handleSessionCleanup();
        },
        24 * 60 * 60 * 1000,
      );
    }, msUntilCleanup);
  }

  private async handleSessionCleanup() {
    try {
      await this.userSessionService.cleanupExpiredSessions(this.expirationDays);
    } catch (error) {
      this.logger.error(`Session cleanup failed: ${error.message}`, error.stack);
    }
  }

  async cleanup(expirationDays?: number): Promise<void> {
    const days = expirationDays ?? this.expirationDays;
    await this.userSessionService.cleanupExpiredSessions(days);
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}
