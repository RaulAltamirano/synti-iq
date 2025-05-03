import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PepperStrategy {
  private readonly pepper: string;

  constructor(private readonly configService: ConfigService) {
    this.pepper = this.configService.get<string>('PASSWORD_PEPPER') || '';
    if (!this.pepper) {
      throw new Error('Password pepper must be configured');
    }
  }

  /**
   * Applies pepper to a password
   * @param password The password to pepper
   * @returns The peppered password
   */
  apply(password: string): string {
    return `${password}${this.pepper}`;
  }
}
