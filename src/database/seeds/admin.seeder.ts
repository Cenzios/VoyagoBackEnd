import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseSeeder } from './base-seeder';
import { User } from '../../modules/users/entities/user.entity';
import { ADMIN_DATA } from './data/admin.data';

@Injectable()
export class AdminSeeder extends BaseSeeder<User> {
    constructor(
        @InjectRepository(User)
        repository: Repository<User>,
    ) {
        super(repository, 'Admin');
    }

    getData() {
        return ADMIN_DATA;
    }

    getUniqueKey(): keyof User {
        return 'email';
    }
}