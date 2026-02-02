import {
    Injectable,
    CanActivate,
    ExecutionContext,
    HttpException,

    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AppVersionService } from '../../modules/app-version/app-version.service';
import { Platform } from '../../modules/app-version/entities/app-version.entity';

@Injectable()
export class VersionGuard implements CanActivate {
    private readonly logger = new Logger(VersionGuard.name);

    constructor(
        private appVersionService: AppVersionService,
        private reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Check if version check is skipped for this route
        const skipVersionCheck = this.reflector.get<boolean>(
            'skipVersionCheck',
            context.getHandler(),
        );

        if (skipVersionCheck) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();

        // Extract version and platform from headers
        const appVersion = request.headers['x-app-version'] as string;
        const platformHeader = (request.headers['x-platform'] as string)?.toLowerCase();

        // If no version header
        if (!appVersion || !platformHeader) {
            const userAgent = (request.headers['user-agent'] as string) || '';

            // Allow Postman to bypass check
            if (userAgent.toLowerCase().includes('postman')) {
                return true;
            }

            // For others (including Web browsers), require headers
            throw new HttpException(
                {
                    statusCode: HttpStatus.BAD_REQUEST,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    method: request.method,
                    message: 'Missing required headers: x-app-version, x-platform',
                    success: false,
                    data: null,
                },
                HttpStatus.BAD_REQUEST,
            );
        }

        // Validate platform
        const platform = this.getPlatform(platformHeader);
        if (!platform) {
            this.logger.warn(`Invalid platform: ${platformHeader}`);
            return true; // Allow if platform is invalid
        }

        // Check version
        const versionCheck = await this.appVersionService.isVersionSupported(
            appVersion,
            platform,
        );

        if (!versionCheck.supported) {
            const { versionInfo } = versionCheck;

            this.logger.warn(
                `Version check failed for ${platform} v${appVersion}. Min: ${versionInfo?.minimumVersion}`,
            );

            throw new HttpException(
                {
                    statusCode: 426,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    method: request.method,
                    message: versionInfo?.updateMessage || 'Please update your app to continue.',
                    success: false,
                    data: null,
                    versionInfo: {
                        currentVersion: appVersion,
                        minimumVersion: versionInfo?.minimumVersion,
                        latestVersion: versionInfo?.latestVersion,
                        forceUpdate: versionCheck.forceUpdate,
                        updateUrl: versionInfo?.updateUrl,
                    },
                },
                426,
            );
        }

        // Optionally warn about available updates (but don't block)
        if (versionCheck.updateAvailable && !versionCheck.forceUpdate) {
            this.logger.log(
                `Update available for ${platform} v${appVersion}. Latest: ${versionCheck.versionInfo?.latestVersion}`,
            );
        }

        return true;
    }

    private getPlatform(platformHeader: string): Platform | null {
        const platformMap: Record<string, Platform> = {
            ios: Platform.IOS,
            android: Platform.ANDROID,
            web: Platform.WEB,
        };

        return platformMap[platformHeader] || null;
    }
}