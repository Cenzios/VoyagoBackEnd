import { IsDateString, IsString, IsOptional } from 'class-validator';

export class ScheduleMaintenanceDto {
    @IsDateString()
    scheduledStart: Date;

    @IsDateString()
    scheduledEnd: Date;

    @IsOptional()
    @IsString()
    message?: string;
}