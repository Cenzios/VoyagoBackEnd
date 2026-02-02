import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceMode } from './entities/maintenance.entity';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';

@Injectable()
export class MaintenanceService {
    private readonly logger = new Logger(MaintenanceService.name);

    private cacheMode: MaintenanceMode | null = null;
    private lastCacheUpdate = 0;
    private readonly cacheTtl = 5000; // 5 seconds

    constructor(
        @InjectRepository(MaintenanceMode)
        private maintenanceRepository: Repository<MaintenanceMode>,
    ) {
        this.initializeMaintenanceMode();
    }

    private async initializeMaintenanceMode(): Promise<void> {
        const count = await this.maintenanceRepository.count();

        if (count === 0) {
            await this.maintenanceRepository.save({
                enabled: false,
                message: 'System is under maintenance. Please try again later.',
                allowedRoles: ['admin'],
                excludedRoutes: [],
                allowedIps: [],
            });
        }
    }

    async getCurrentMode(): Promise<MaintenanceMode> {
        const now = Date.now();

        if (this.cacheMode && now - this.lastCacheUpdate < this.cacheTtl) {
            return this.cacheMode;
        }

        const mode = await this.maintenanceRepository.findOne({
            where: {},
            order: { updatedAt: 'DESC' },
        });

        if (!mode) {
            throw new Error('Maintenance mode configuration not found');
        }

        const currentTime = new Date();

        if (mode.scheduledStart && mode.scheduledEnd) {
            mode.enabled =
                currentTime >= mode.scheduledStart &&
                currentTime <= mode.scheduledEnd;
        }

        this.cacheMode = mode;
        this.lastCacheUpdate = now;

        return mode;
    }

    async updateMaintenanceMode(
        updateDto: UpdateMaintenanceDto,
        userId?: string,
    ): Promise<MaintenanceMode> {
        const mode = await this.getCurrentMode();

        Object.assign(mode, updateDto);
        mode.createdBy = userId ?? '';

        const updated = await this.maintenanceRepository.save(mode);

        this.cacheMode = null;

        this.logger.log(
            `Maintenance mode ${updated.enabled ? 'ENABLED' : 'DISABLED'} by ${userId || 'system'}`,
        );

        return updated;
    }

    async enableMaintenanceMode(
        message?: string,
        userId?: string,
    ): Promise<MaintenanceMode> {
        return this.updateMaintenanceMode(
            { enabled: true, message },
            userId,
        );
    }

    async disableMaintenanceMode(
        userId?: string,
    ): Promise<MaintenanceMode> {
        return this.updateMaintenanceMode(
            { enabled: false },
            userId,
        );
    }

    async scheduleMaintenanceMode(
        scheduledStart: Date,
        scheduledEnd: Date,
        message?: string,
        userId?: string,
    ): Promise<MaintenanceMode> {
        return this.updateMaintenanceMode(
            {
                scheduledStart,
                scheduledEnd,
                message,
            },
            userId,
        );
    }

    clearCache(): void {
        this.cacheMode = null;
    }
}
