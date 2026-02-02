import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseSeeder } from './base-seeder';
import { Country } from '../../modules/master-data/country.entity';
import { COUNTRIES_DATA } from './data/countries.data';

@Injectable()
export class CountriesSeeder extends BaseSeeder<Country> {
    constructor(
        @InjectRepository(Country)
        repository: Repository<Country>,
    ) {
        super(repository, 'Countries');
    }

    getData() {
        return COUNTRIES_DATA;
    }

    getUniqueKey(): keyof Country {
        return 'code';
    }
}