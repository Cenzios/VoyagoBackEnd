import { Controller, Get } from '@nestjs/common';
import {
    HealthCheck,
    HealthCheckService,
    TypeOrmHealthIndicator,
    MemoryHealthIndicator,
    DiskHealthIndicator,
} from '@nestjs/terminus';
import { SkipMaintenance } from 'src/common/decorators/skip-maintenance.decorator';
import { SkipVersionCheck } from 'src/common/decorators/skip-version-check.decorator';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private db: TypeOrmHealthIndicator,
        private memory: MemoryHealthIndicator,
        private disk: DiskHealthIndicator,
    ) { }

    @Get()
    @SkipMaintenance()
    @SkipVersionCheck()
    async check() {
        const healthCheck = await this.health.check([
            () => this.db.pingCheck('database'),
            () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
            () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
            () => this.disk.checkStorage('storage', {
                path: '/',
                thresholdPercent: 0.9
            }),
        ]);

        // Transform to your standard format
        return {
            message: 'Health check completed',
            data: healthCheck,
        };
    }
}