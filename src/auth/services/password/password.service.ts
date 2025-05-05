import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HashingStrategy } from './strategies/hashing.strategy.ts';
import { PepperStrategy } from './strategies/pepper.strategy.js';
import { LockoutStrategy } from './strategies/lockout.strategy.js';
import { PasswordOptions } from './interfaces/password-options.interface.js';
import {
  DEFAULT_SALT_ROUNDS,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_DURATION,
} from './interfaces/password.constants.js';

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);
  private readonly options: PasswordOptions;

  constructor(
    private readonly hashingStrategy: HashingStrategy,
    private readonly pepperStrategy: PepperStrategy,
    private readonly lockoutStrategy: LockoutStrategy,
  ) {
    this.options = {
      saltRounds: process.env.SALT_ROUNDS
        ? parseInt(process.env.SALT_ROUNDS)
        : DEFAULT_SALT_ROUNDS,
      maxAttempts: MAX_LOGIN_ATTEMPTS,
      lockoutDuration: LOCKOUT_DURATION,
    };
  }

  /**
   * Hashes a password with salt and pepper
   * @param plainPassword The password to hash
   * @returns Promise resolving to the hashed password
   * @throws {BadRequestException} If password is empty
   * @throws {InternalServerErrorException} If hashing fails
   */
  async hash(plainPassword: string): Promise<string> {
    if (!plainPassword?.trim()) {
      throw new BadRequestException('Password cannot be empty');
    }

    try {
      const pepperedPassword = this.pepperStrategy.apply(plainPassword);
      return await this.hashingStrategy.hash(
        pepperedPassword,
        this.options.saltRounds,
      );
    } catch (error) {
      this.logger.error(`Hashing failed: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Password processing failed');
    }
  }

  /**
   * Verifies a password against a hash with account lockout protection
   * @param plainPassword The password to verify
   * @param hashedPassword The hash to compare against
   * @param identifier Account identifier (email/userId) for lockout tracking
   * @returns Promise resolving to boolean indicating match
   * @throws {BadRequestException} If inputs are invalid
   * @throws {UnauthorizedException} If account is locked or max attempts reached
   */
  async verify(
    plainPassword: string,
    hashedPassword: string,
    identifier: string,
  ): Promise<boolean> {
    if (!plainPassword || !hashedPassword || !identifier) {
      throw new BadRequestException(
        'Password, hash and identifier are required',
      );
    }

    await this.lockoutStrategy.checkLockout(identifier);

    try {
      const pepperedPassword = this.pepperStrategy.apply(plainPassword);
      const isMatch = await this.hashingStrategy.compare(
        pepperedPassword,
        hashedPassword,
      );

      if (isMatch) {
        await this.lockoutStrategy.resetAttempts(identifier);
        return true;
      }

      await this.lockoutStrategy.recordFailedAttempt(identifier);
      return false;
    } catch (error) {
      this.logger.error(
        `Verification failed for ${identifier}: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Password verification failed');
    }
  }

  /**
   * Compares data with a hash (without lockout or pepper)
   * @param data The data to compare
   * @param hash The hash to compare against
   * @returns Promise resolving to boolean indicating match
   */
  async compare(data: string, hash: string): Promise<boolean> {
    return this.hashingStrategy.compare(data, hash);
  }
}
