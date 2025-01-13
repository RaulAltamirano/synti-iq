import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  getMethod(): string {
    this.logger.log('Run getMethod');
    return 'success';
  }
  getMethodAuth(): string {
    this.logger.log('Run getMethodAuth');
    return 'success';
  }
  postMethod(): string {
    this.logger.log('Run postMethod');
    return 'success';
  }
  putMethod(): string {
    this.logger.log('Run putMethod');
    return 'success';
  }
  deleteMethod() {
    this.logger.log('Run deleteMethod');
  }
}
