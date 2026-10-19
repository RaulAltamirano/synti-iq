import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashingStrategy {
  async hash(data: string, saltRounds: number): Promise<string> {
    return bcrypt.hash(data, saltRounds);
  }

  async compare(data: string, hash: string): Promise<boolean> {
    return bcrypt.compare(data, hash);
  }
}
