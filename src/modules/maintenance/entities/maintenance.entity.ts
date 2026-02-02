import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('maintenance_modes')
export class MaintenanceMode {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: false })
    enabled: boolean;

    @Column({ type: 'text', nullable: true })
    message: string;

    @Column({ type: 'timestamp', nullable: true })
    scheduledStart: Date;

    @Column({ type: 'timestamp', nullable: true })
    scheduledEnd: Date;

    @Column({ type: 'jsonb', default: [] })
    allowedIps: string[];

    @Column({ type: 'jsonb', default: ['admin'] })
    allowedRoles: string[];

    @Column({ type: 'jsonb', default: [] })
    excludedRoutes: string[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    createdBy: string;
}