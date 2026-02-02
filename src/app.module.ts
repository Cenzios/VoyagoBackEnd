import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { MaintenanceModule } from './modules/maintenance/maintenance.module';
import { APP_GUARD } from '@nestjs/core';
import { MaintenanceGuard } from './common/guards/maintenance.guard';
import { AppVersionModule } from './modules/app-version/app-version.module';
import { VersionGuard } from './common/guards/version.guard';
import { SeederModule } from './database/seeds/seeder.module';
import { MasterDataModule } from './modules/master-data/master-data.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    DatabaseModule,
    UsersModule,
    AuthModule,
    HealthModule,
    MaintenanceModule,
    AppVersionModule,
    SeederModule,
    MasterDataModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: VersionGuard,
    },
    {
      provide: APP_GUARD,
      useClass: MaintenanceGuard,
    },
  ],
})
export class AppModule { }