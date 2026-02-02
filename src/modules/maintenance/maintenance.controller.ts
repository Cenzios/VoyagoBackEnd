import {
    Controller,
    Get,
    Post,
    Body,
    UseGuards,
    Request,
} from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { ScheduleMaintenanceDto } from './dto/schedule-maintenance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SkipMaintenance } from '../../common/decorators/skip-maintenance.decorator';

@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@SkipMaintenance()
export class MaintenanceController {
    constructor(private readonly maintenanceService: MaintenanceService) { }

    @Get('status')
    async getStatus() {
        return this.maintenanceService.getCurrentMode();
    }

    @Post('enable')
    async enable(@Body('message') message: string, @Request() req) {
        return this.maintenanceService.enableMaintenanceMode(
            message,
            req.user?.userId,
        );
    }

    @Post('disable')
    async disable(@Request() req) {
        return this.maintenanceService.disableMaintenanceMode(req.user?.userId);
    }

    @Post('update')
    async update(@Body() updateDto: UpdateMaintenanceDto, @Request() req) {
        return this.maintenanceService.updateMaintenanceMode(
            updateDto,
            req.user?.userId,
        );
    }

    @Post('schedule')
    async schedule(@Body() scheduleDto: ScheduleMaintenanceDto, @Request() req) {
        return this.maintenanceService.scheduleMaintenanceMode(
            scheduleDto.scheduledStart,
            scheduleDto.scheduledEnd,
            scheduleDto.message,
            req.user?.userId,
        );
    }

    @Post('clear-cache')
    async clearCache() {
        this.maintenanceService.clearCache();
        return { message: 'Cache cleared successfully' };
    }
}