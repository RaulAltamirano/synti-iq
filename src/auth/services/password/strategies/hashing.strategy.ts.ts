import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashingStrategy {
  /**
   * Hashes data with bcrypt
   * @param data The data to hash
   * @param saltRounds Number of salt rounds
   * @returns Promise resolving to the hashed value
   */
  async hash(data: string, saltRounds: number): Promise<string> {
    return bcrypt.hash(data, saltRounds);
  }

  /**
   * Compares data with a hash using constant-time comparison
   * @param data The data to compare
   * @param hash The hash to compare against
   * @returns Promise resolving to boolean indicating match
   */
  async compare(data: string, hash: string): Promise<boolean> {
    return bcrypt.compare(data, hash);
  }
}
