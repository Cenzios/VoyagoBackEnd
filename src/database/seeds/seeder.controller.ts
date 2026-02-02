import {
    Controller,
    Post,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { MasterSeederService } from '../../database/seeds/master-seeder.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SkipMaintenance } from '../../common/decorators/skip-maintenance.decorator';

@Controller('admin/seeder')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@SkipMaintenance()
export class SeederController {
    constructor(private masterSeederService: MasterSeederService) { }

    @Post('run-all')
    @HttpCode(HttpStatus.OK)
    async runAll(
        @Query('updateExisting') updateExisting?: string,
        @Query('deleteOrphans') deleteOrphans?: string,
        @Query('dryRun') dryRun?: string,
    ) {
        const data = await this.masterSeederService.seedAll({
            updateExisting: updateExisting === 'true',
            deleteOrphans: deleteOrphans === 'true',
            dryRun: dryRun === 'true',
        });

        return {
            message: dryRun === 'true'
                ? 'Dry run completed - no changes made'
                : 'Master data seeding completed successfully',
            data,
        };
    }

    @Post('countries')
    @HttpCode(HttpStatus.OK)
    async seedCountries(
        @Query('updateExisting') updateExisting?: string,
        @Query('deleteOrphans') deleteOrphans?: string,
    ) {
        const data = await this.masterSeederService.seedCountries({
            updateExisting: updateExisting === 'true',
            deleteOrphans: deleteOrphans === 'true',
        });

        return {
            message: 'Countries seeded successfully',
            data,
        };
    }

    @Post('admin')
    @HttpCode(HttpStatus.OK)
    async seedAdmin(
        @Query('updateExisting') updateExisting?: string,
        @Query('deleteOrphans') deleteOrphans?: string,
    ) {
        const data = await this.masterSeederService.seedAdmin({
            updateExisting: updateExisting === 'true',
            deleteOrphans: deleteOrphans === 'true',
        });

        return {
            message: 'Admin seeded successfully',
            data,
        };
    }
}