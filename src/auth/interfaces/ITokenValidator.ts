import { JwtPayload } from 'src/shared/jwt-helper/interfaces/jwt-payload.interface';

export interface ITokenValidator {
  validate(payload: JwtPayload): Promise<void>;
}
