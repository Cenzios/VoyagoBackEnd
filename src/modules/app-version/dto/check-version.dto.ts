import { IsString, IsEnum } from 'class-validator';
import { Platform } from '../entities/app-version.entity';

export class CheckVersionDto {
    @IsString()
    version: string;

    @IsEnum(Platform)
    platform: Platform;
}