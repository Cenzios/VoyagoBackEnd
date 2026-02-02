import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { Platform } from '../entities/app-version.entity';

export class UpdateVersionDto {
    @IsEnum(Platform)
    platform: Platform;

    @IsOptional()
    @IsString()
    minimumVersion?: string;

    @IsOptional()
    @IsString()
    latestVersion?: string;

    @IsOptional()
    @IsBoolean()
    forceUpdate?: boolean;

    @IsOptional()
    @IsString()
    updateMessage?: string;

    @IsOptional()
    @IsString()
    updateUrl?: string;
}