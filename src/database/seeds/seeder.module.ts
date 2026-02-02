import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MasterSeederService } from './master-seeder.service';
import { CountriesSeeder } from './countries.seeder';
import { Country } from '../../modules/master-data/country.entity';
import { AdminSeeder } from './admin.seeder';
import { User } from 'src/modules/users/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Country,
            User,
        ]),
    ],
    providers: [
        MasterSeederService,
        CountriesSeeder,
        AdminSeeder,
    ],
    exports: [MasterSeederService],
})
export class SeederModule { }