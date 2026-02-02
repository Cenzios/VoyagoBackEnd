import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum Platform {
    IOS = 'ios',
    ANDROID = 'android',
    WEB = 'web',
}

@Entity('app_versions')
export class AppVersion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: Platform,
        unique: true,
    })
    platform: Platform;

    @Column({ name: 'minimum_version' })
    minimumVersion: string; // e.g., "1.2.0"

    @Column({ name: 'latest_version' })
    latestVersion: string; // e.g., "1.5.0"

    @Column({ name: 'force_update', default: false })
    forceUpdate: boolean; // If true, block all API calls

    @Column({ type: 'text', nullable: true })
    updateMessage: string;

    @Column({ type: 'text', nullable: true })
    updateUrl: string; // App Store / Play Store URL

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}