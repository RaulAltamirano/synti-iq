import {
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { createHash, randomBytes } from 'node:crypto';

import { AccountInvitation } from 'src/auth/entities/account-invitation.entity';
import { User } from 'src/user/entities/user.entity';
import { PasswordService } from 'src/password/password.service';
import { ObservabilityService } from 'src/shared/observability/observability.service';
import {
  ATTR_AUTH_INVITATION_USER_ID,
  AUTH_INVITATION_SPAN_NAMES,
} from 'src/auth/constants/auth-span.constants';

export interface CreateInvitationResult {
  rawToken: string;
  invitation: AccountInvitation;
}

@Injectable()
export class AccountInvitationService {
  private readonly logger = new Logger(AccountInvitationService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly passwordService: PasswordService,
    private readonly observabilityService: ObservabilityService,
  ) {}

  static hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken, 'utf8').digest('hex');
  }

  /**
   * Creates a new invitation; marks any previous unused invitations for this user as used
   * so only the latest link works.
   */
  async createForUser(userId: string, expiresAt: Date): Promise<CreateInvitationResult> {
    return this.observabilityService.withSpan(AUTH_INVITATION_SPAN_NAMES.CREATE, async span => {
      span.setAttribute(ATTR_AUTH_INVITATION_USER_ID, userId);

      const rawToken = randomBytes(32).toString('base64url');
      const tokenHash = AccountInvitationService.hashToken(rawToken);

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await queryRunner.manager
          .createQueryBuilder()
          .update(AccountInvitation)
          .set({ usedAt: new Date() })
          .where('user_id = :userId', { userId })
          .andWhere('used_at IS NULL')
          .execute();

        const invitation = queryRunner.manager.create(AccountInvitation, {
          userId,
          tokenHash,
          expiresAt,
          usedAt: null,
        });
        const saved = await queryRunner.manager.save(invitation);

        await queryRunner.commitTransaction();
        return { rawToken, invitation: saved };
      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error(
          `Failed to create account invitation for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
        );
        throw error;
      } finally {
        await queryRunner.release();
      }
    });
  }

  /**
   * Validates token, sets user password, marks invitation used (single transaction).
   */
  async consumeInvitation(rawToken: string, plainPassword: string): Promise<void> {
    return this.observabilityService.withSpan(AUTH_INVITATION_SPAN_NAMES.CONSUME, async span => {
      const tokenHash = AccountInvitationService.hashToken(rawToken);

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const invitation = await queryRunner.manager
          .getRepository(AccountInvitation)
          .createQueryBuilder('inv')
          .setLock('pessimistic_write')
          .where('inv.tokenHash = :tokenHash', { tokenHash })
          .getOne();

        if (!invitation || invitation.usedAt) {
          await queryRunner.rollbackTransaction();
          throw new NotFoundException('Invalid or expired invitation');
        }

        span.setAttribute(ATTR_AUTH_INVITATION_USER_ID, invitation.userId);

        if (invitation.expiresAt.getTime() < Date.now()) {
          await queryRunner.rollbackTransaction();
          throw new UnprocessableEntityException('Invitation has expired');
        }

        const user = await queryRunner.manager.findOne(User, {
          where: { id: invitation.userId, deletedAt: IsNull() },
        });

        if (!user) {
          await queryRunner.rollbackTransaction();
          throw new NotFoundException('Invalid or expired invitation');
        }

        if (user.password) {
          await queryRunner.rollbackTransaction();
          throw new UnprocessableEntityException('Password has already been set');
        }

        const hashedPassword = await this.passwordService.hash(plainPassword);
        await queryRunner.manager.update(User, invitation.userId, { password: hashedPassword });
        await queryRunner.manager.update(AccountInvitation, invitation.id, {
          usedAt: new Date(),
        });

        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        if (error instanceof NotFoundException || error instanceof UnprocessableEntityException) {
          throw error;
        }
        this.logger.error(
          `consumeInvitation failed: ${error instanceof Error ? error.message : String(error)}`,
        );
        throw error;
      } finally {
        await queryRunner.release();
      }
    });
  }
}
