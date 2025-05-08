import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from 'src/shared/jwt-helper/interfaces/jwt-payload.interface';
import { ITokenValidator } from '../interfaces/ITokenValidator';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { TokenPayloadDto } from '../dto/token-payload.dto';

@Injectable()
export class TokenFormatValidator implements ITokenValidator {
  private readonly logger = new Logger(TokenFormatValidator.name);

  /**
   * Validates the JWT payload format using DTO validation
   *
   * @param payload - The JWT payload to validate
   * @throws UnauthorizedException when the token format is invalid
   */
  async validate(payload: JwtPayload): Promise<void> {
    try {
      const payloadDto = plainToInstance(TokenPayloadDto, payload);
      const errors = await validate(payloadDto);

      if (errors.length > 0) {
        const errorMessages = errors
          .map((error) => Object.values(error.constraints || {}).join(', '))
          .join('; ');

        this.logger.warn(`Token validation failed: ${errorMessages}`);
        throw new UnauthorizedException(
          `Invalid token format: ${errorMessages}`,
        );
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        `Token validation error: ${error.message}`,
        error.stack,
      );
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
