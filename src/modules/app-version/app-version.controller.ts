import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { AppVersionService } from './app-version.service';
import { UpdateVersionDto } from './dto/update-version.dto';
import { CheckVersionDto } from './dto/check-version.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SkipVersionCheck } from '../../common/decorators/skip-version-check.decorator';
import { SkipMaintenance } from '../../common/decorators/skip-maintenance.decorator';

@Controller('app-version')
@SkipVersionCheck() // Don't check version on version endpoints
@SkipMaintenance()
export class AppVersionController {
    constructor(private readonly appVersionService: AppVersionService) { }

    @Get('check')
    async checkVersion(@Query() checkVersionDto: CheckVersionDto) {
        const result = await this.appVersionService.isVersionSupported(
            checkVersionDto.version,
            checkVersionDto.platform,
        );

        return {
            message: result.supported
                ? 'Version is supported'
                : 'Update required',
            data: result,
        };
    }

    @Get('all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    async getAllVersions() {
        const platforms = ['ios', 'android', 'web'];
        const versions = await Promise.all(
            platforms.map(async (platform) => {
                const version = await this.appVersionService.getMinimumVersion(
                    platform as any,
                );
                return { platform, ...version };
            }),
        );

        return {
            message: 'All versions fetched successfully',
            data: versions,
        };
    }

    @Post('update')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @HttpCode(HttpStatus.OK)
    async updateVersion(@Body() updateVersionDto: UpdateVersionDto) {
        const data = await this.appVersionService.updateVersion(
            updateVersionDto.platform,
            updateVersionDto.minimumVersion,
            updateVersionDto.latestVersion,
            updateVersionDto.forceUpdate,
            updateVersionDto.updateMessage,
            updateVersionDto.updateUrl,
        );

        return {
            message: 'Version updated successfully',
            data,
        };
    }

    @Post('clear-cache')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @HttpCode(HttpStatus.OK)
    async clearCache() {
        this.appVersionService.clearCache();
        return {
            message: 'Cache cleared successfully',
            data: null,
        };
    }
}