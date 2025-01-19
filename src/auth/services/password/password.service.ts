import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
// import { EmailService } from 'src/email/email.service';
import { randomBytes } from 'crypto';
import { promisify } from 'util';
import { RedisService } from 'src/shared/redis/redis.service';

const randomBytesAsync = promisify(randomBytes);

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);

  private readonly SALT_ROUNDS = process.env.SALT_ROUNDS
    ? parseInt(process.env.SALT_ROUNDS)
    : 12;
  private readonly RECOVERY_TOKEN_LENGTH = 32;
  private readonly RECOVERY_TOKEN_EXPIRY = 3600;
  private readonly TOKEN_PREFIX = 'pwReset:';
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 900;

  constructor(
    private readonly redisService: RedisService,
    // private readonly userService: UserService,
  ) {}
  /**
   * Hashes a password using bcrypt with pepper
   */
  async hash(password: string): Promise<string> {
    // Add pepper to password before hashing
    const pepperedPassword = `${password}${process.env.PASSWORD_PEPPER}`;

    try {
      return await bcrypt.hash(pepperedPassword, this.SALT_ROUNDS);
    } catch (error) {
      this.logger.error('Error hashing password', error);
      throw new Error('Error processing password');
    }
  }

  /**
   * Verifies a password against its hash
   */
  async verify(
    plainPassword: string,
    hashedPassword: string,
    email: string,
  ): Promise<boolean> {
    const attemptsKey = `loginAttempts:${email}`;

    // Check if account is locked
    const lockoutTime = await this.redisService.get(`lockout:${email}`);
    if (lockoutTime) {
      throw new UnauthorizedException(
        'Account is temporarily locked. Please try again later.',
      );
    }

    try {
      // Add pepper to password before verification
      const pepperedPassword = `${plainPassword}${process.env.PASSWORD_PEPPER}`;
      const isMatch = await bcrypt.compare(pepperedPassword, hashedPassword);

      if (!isMatch) {
        // Increment failed attempts
        const attempts = await this.redisService.incr(attemptsKey);
        await this.redisService.expire(attemptsKey, this.LOCKOUT_DURATION);

        if (attempts >= this.MAX_ATTEMPTS) {
          // Lock account
          await this.redisService.set(
            `lockout:${email}`,
            'locked',
            this.LOCKOUT_DURATION,
          );
          throw new UnauthorizedException(
            'Too many failed attempts. Account locked for 15 minutes.',
          );
        }
      } else {
        // Reset attempts on successful login
        await this.redisService.del(attemptsKey);
      }

      return isMatch;
    } catch (error) {
      this.logger.error('Error verifying password', error);
      throw error;
    }
  }

  /**
   * Initiates password recovery process
   */
  async initiateRecovery(email: string): Promise<void> {
    try {
      // Generate cryptographically secure token
      const tokenBuffer = await randomBytesAsync(this.RECOVERY_TOKEN_LENGTH);
      const token = tokenBuffer.toString('hex');
      const hashedToken = await this.hash(token);

      // Store token with email
      const key = `${this.TOKEN_PREFIX}${hashedToken}`;
      await this.redisService.set(key, email, this.RECOVERY_TOKEN_EXPIRY);

      // Send recovery email
      // await this.emailService.sendPasswordRecovery(email, token);

      this.logger.debug(`Recovery initiated for ${email}`);
    } catch (error) {
      this.logger.error('Error initiating password recovery', error);
      throw new Error('Error processing recovery request');
    }
  }

  /**
   * Validates a recovery token
   */
  async validateRecoveryToken(token: string): Promise<string> {
    try {
      const hashedToken = await this.hash(token);
      const key = `${this.TOKEN_PREFIX}${hashedToken}`;
      const email = await this.redisService.get(key).toString();

      if (!email) {
        throw new UnauthorizedException('Invalid or expired recovery token');
      }

      return email;
    } catch (error) {
      this.logger.error('Error validating recovery token', error);
      throw error;
    }
  }

  /**
   * Completes the password recovery process
   */
  async completeRecovery(token: string, newPassword: string): Promise<void> {
    const multi = this.redisService.multi();

    try {
      const email = await this.validateRecoveryToken(token);
      const hashedToken = await this.hash(token);
      const key = `${this.TOKEN_PREFIX}${hashedToken}`;

      // Update password and invalidate token atomically
      multi.del(key);
      await multi.exec();

      // Update user password
      // await this.userService.updatePassword(email, newPassword);

      this.logger.debug(`Password recovery completed for ${email}`);
    } catch (error) {
      // Rollback transaction if there's an error
      await multi.discard();
      this.logger.error('Error completing password recovery', error);
      throw error;
    }
  }
}
