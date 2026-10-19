import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err) {
      this.logger.error(`JWT Auth Guard error: ${err.message}`, err.stack, { info });

      if (err.name === 'TokenExpiredError' || err.message?.includes('expired')) {
        throw new UnauthorizedException('Token expired. Please refresh your token.');
      }

      if (err.name === 'JsonWebTokenError' || err.name === 'UnauthorizedException') {
        throw err instanceof UnauthorizedException
          ? err
          : new UnauthorizedException('Invalid token');
      }

      if (err.message?.includes('missing')) {
        throw new UnauthorizedException(err.message);
      }

      throw err;
    }

    if (!user) {
      this.logger.warn('JWT Auth Guard: No user returned from strategy', { info });
      throw new UnauthorizedException('Invalid or expired token');
    }

    return user;
  }
}
