import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ServiceUnavailableException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { MaintenanceService } from '../../modules/maintenance/maintenance.service';

@Injectable()
export class MaintenanceGuard implements CanActivate {
    constructor(
        private maintenanceService: MaintenanceService,
        private reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Check if route is excluded from maintenance mode
        const skipMaintenance = this.reflector.get<boolean>(
            'skipMaintenance',
            context.getHandler(),
        );

        if (skipMaintenance) {
            return true;
        }

        const maintenanceMode = await this.maintenanceService.getCurrentMode();

        if (!maintenanceMode.enabled) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const path = request.path;

        // Check if route is in excluded routes
        if (maintenanceMode.excludedRoutes.some((route) => path.includes(route))) {
            return true;
        }

        // Allow access from whitelisted IPs
        const clientIP = this.getClientIP(request);
        if (maintenanceMode.allowedIps.includes(clientIP)) {
            return true;
        }

        // Allow access for specific roles
        const user = request.user as any;
        if (user) {
            const hasAllowedRole = user.roles?.some((role: string) =>
                maintenanceMode.allowedRoles.includes(role),
            );

            if (hasAllowedRole) {
                return true;
            }
        }

        // Throw maintenance exception
        throw new ServiceUnavailableException({
            statusCode: 503,
            message: maintenanceMode.message,
            maintenance: true,
            scheduled_end: maintenanceMode.scheduledEnd,
        });
    }

    private getClientIP(request: Request): string {
        const xForwardedFor = request.headers['x-forwarded-for'];
        const forwardedIp = Array.isArray(xForwardedFor)
            ? xForwardedFor[0]
            : xForwardedFor?.split(',')[0];

        const xRealIp = request.headers['x-real-ip'];
        const realIp = Array.isArray(xRealIp) ? xRealIp[0] : xRealIp;

        return (
            forwardedIp ||
            realIp ||
            request.socket.remoteAddress ||
            ''
        );
    }
}