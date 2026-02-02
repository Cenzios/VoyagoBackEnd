import { Injectable, Logger } from '@nestjs/common';
import { CountriesSeeder } from './countries.seeder';
import { SeederOptions } from './base-seeder';
import { AdminSeeder } from './admin.seeder';

@Injectable()
export class MasterSeederService {
    private readonly logger = new Logger(MasterSeederService.name);

    constructor(
        private countriesSeeder: CountriesSeeder,
        private adminSeeder: AdminSeeder,
    ) { }

    async seedAll(options: SeederOptions = {}) {
        this.logger.log('🌱 Starting master data seeding...');

        const results = {
            countries: await this.countriesSeeder.seed(options),
            admin: await this.adminSeeder.seed(options),
        };

        this.logger.log('✅ Master data seeding complete!');
        this.logger.log('Summary:', JSON.stringify(results, null, 2));

        return results;
    }

    async seedCountries(options: SeederOptions = {}) {
        return this.countriesSeeder.seed(options);
    }

    async seedAdmin(options: SeederOptions = {}) {
        return this.adminSeeder.seed(options);
    }


}