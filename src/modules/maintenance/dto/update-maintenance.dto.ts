import {
    IsBoolean,
    IsString,
    IsOptional,
    IsArray,
    IsDateString,
} from 'class-validator';

export class UpdateMaintenanceDto {
    @IsOptional()
    @IsBoolean()
    enabled?: boolean;

    @IsOptional()
    @IsString()
    message?: string;

    @IsOptional()
    @IsDateString()
    scheduledStart?: Date;

    @IsOptional()
    @IsDateString()
    scheduledEnd?: Date;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allowedIps?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allowedRoles?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    excludedRoutes?: string[];
}