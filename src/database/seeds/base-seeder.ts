import { Logger } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';

export interface SeederOptions {
    updateExisting?: boolean; // Update if exists
    deleteOrphans?: boolean; // Delete records not in seed data
    dryRun?: boolean; // Log changes without applying
}

export abstract class BaseSeeder<T extends ObjectLiteral> {
    protected logger: Logger;

    constructor(
        protected repository: Repository<T>,
        protected entityName: string,
    ) {
        this.logger = new Logger(`${entityName}Seeder`);
    }

    abstract getData(): any[];
    abstract getUniqueKey(): keyof T;

    async seed(options: SeederOptions = {}): Promise<{
        created: number;
        updated: number;
        deleted: number;
        unchanged: number;
    }> {
        const {
            updateExisting = true,
            deleteOrphans = false,
            dryRun = false,
        } = options;

        const seedData = this.getData();
        const uniqueKey = this.getUniqueKey() as string;

        let created = 0;
        let updated = 0;
        let deleted = 0;
        let unchanged = 0;

        this.logger.log(`Starting ${this.entityName} seeding...`);

        // Get existing records
        const existingRecords = await this.repository.find();
        const existingMap = new Map(
            existingRecords.map((record) => [(record as any)[uniqueKey], record]),
        );

        // Track which records we've seen
        const seenKeys = new Set<string>();

        // Process seed data
        for (const data of seedData) {
            const key = data[uniqueKey];
            seenKeys.add(key);

            const existing = existingMap.get(key);

            if (!existing) {
                // Create new record
                if (!dryRun) {
                    await this.repository.save(data);
                }
                created++;
                this.logger.log(`Created: ${key}`);
            } else if (updateExisting) {
                // Check if update is needed
                const hasChanges = this.hasChanges(existing, data);

                if (hasChanges) {
                    if (!dryRun) {
                        await this.repository.update({ [uniqueKey]: key } as any, data);
                    }
                    updated++;
                    this.logger.log(`Updated: ${key}`);
                } else {
                    unchanged++;
                }
            } else {
                unchanged++;
            }
        }

        // Delete orphaned records
        if (deleteOrphans) {
            for (const [key, record] of existingMap) {
                if (!seenKeys.has(key)) {
                    // Check if it's a system record that shouldn't be deleted
                    if ((record as any).isSystem) {
                        this.logger.warn(`Skipping deletion of system record: ${key}`);
                        continue;
                    }

                    if (!dryRun) {
                        await this.repository.delete({ [uniqueKey]: key } as any);
                    }
                    deleted++;
                    this.logger.log(`Deleted: ${key}`);
                }
            }
        }

        const summary = { created, updated, deleted, unchanged };
        this.logger.log(`${this.entityName} seeding complete:`, summary);

        return summary;
    }

    private hasChanges(existing: any, newData: any): boolean {
        // Compare relevant fields (exclude timestamps and id)
        const excludeFields = ['id', 'createdAt', 'updatedAt', 'created_at', 'updated_at'];

        for (const key of Object.keys(newData)) {
            if (excludeFields.includes(key)) continue;

            const existingValue = existing[key];
            const newValue = newData[key];

            // Deep comparison for objects/arrays
            if (JSON.stringify(existingValue) !== JSON.stringify(newValue)) {
                return true;
            }
        }

        return false;
    }
}