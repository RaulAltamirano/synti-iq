import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { isIP } from 'net';
import { UAParser } from 'ua-parser-js';
import { SessionMetadata } from '../interfaces/session-metadata.interface';

@Injectable()
export class AuthMetadataService {
  extractSessionMetadata(request?: Request): SessionMetadata {
    if (!request) {
      return {
        lastUsed: new Date(),
      };
    }

    const userAgent = request.headers['user-agent'];
    const forwardedFor = request.headers['x-forwarded-for']?.toString();
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : null;

    const uaParser = new UAParser(userAgent);
    const deviceInfo = {
      deviceType: this.determineDeviceType(uaParser.getDevice().type),
      deviceName: uaParser.getDevice().model || uaParser.getOS().name,
      browser: uaParser.getBrowser().name,
      browserVersion: uaParser.getBrowser().version,
      os: uaParser.getOS().name,
      osVersion: uaParser.getOS().version,
      userAgent: userAgent || null,
      ipAddress: isIP(ipAddress) ? ipAddress : null,
    };

    return {
      deviceInfo,
      lastUsed: new Date(),
    };
  }

  private determineDeviceType(deviceType: string | undefined): string {
    if (!deviceType) return 'desktop';

    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return 'mobile';
      case 'tablet':
        return 'tablet';
      default:
        return 'desktop';
    }
  }
}
