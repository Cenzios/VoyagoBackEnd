import 'tsconfig-paths/register'; // Add this at the very top
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { MasterSeederService } from './master-seeder.service';

async function runSeeder() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const seeder = app.get(MasterSeederService);

    const args = process.argv.slice(2);
    const updateExisting = args.includes('--update');
    const deleteOrphans = args.includes('--delete-orphans');
    const dryRun = args.includes('--dry-run');

    await seeder.seedAll({
        updateExisting,
        deleteOrphans,
        dryRun,
    });

    await app.close();
}

runSeeder().catch(console.error);