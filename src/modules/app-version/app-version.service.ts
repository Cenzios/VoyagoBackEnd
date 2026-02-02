import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppVersion, Platform } from './entities/app-version.entity';

@Injectable()
export class AppVersionService {
    private readonly logger = new Logger(AppVersionService.name);
    private versionCache: Map<Platform, AppVersion> = new Map();
    private lastCacheUpdate = 0;
    private readonly CACHE_TTL = 60000; // 1 minute

    constructor(
        @InjectRepository(AppVersion)
        private appVersionRepository: Repository<AppVersion>,
    ) {
        this.loadVersionsIntoCache();
    }

    private async loadVersionsIntoCache(): Promise<void> {
        try {
            const versions = await this.appVersionRepository.find({
                where: { isActive: true },
            });

            versions.forEach((version) => {
                this.versionCache.set(version.platform, version);
            });

            this.lastCacheUpdate = Date.now();
            this.logger.log('App versions loaded into cache');
        } catch (error) {
            this.logger.error('Failed to load app versions into cache', error);
        }
    }

    async getMinimumVersion(platform: Platform): Promise<AppVersion | null> {
        const now = Date.now();

        // Refresh cache if expired
        if (now - this.lastCacheUpdate > this.CACHE_TTL) {
            await this.loadVersionsIntoCache();
        }

        return this.versionCache.get(platform) || null;
    }

    compareVersions(version1: string, version2: string): number {
        const v1Parts = version1.split('.').map(Number);
        const v2Parts = version2.split('.').map(Number);

        for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
            const v1 = v1Parts[i] || 0;
            const v2 = v2Parts[i] || 0;

            if (v1 > v2) return 1;
            if (v1 < v2) return -1;
        }

        return 0;
    }

    async isVersionSupported(
        currentVersion: string,
        platform: Platform,
    ): Promise<{
        supported: boolean;
        forceUpdate: boolean;
        updateAvailable: boolean;
        versionInfo?: AppVersion;
    }> {
        const versionInfo = await this.getMinimumVersion(platform);

        if (!versionInfo) {
            // No version info found, allow by default
            return {
                supported: true,
                forceUpdate: false,
                updateAvailable: false,
            };
        }

        const isSupported =
            this.compareVersions(currentVersion, versionInfo.minimumVersion) >= 0;

        const updateAvailable =
            this.compareVersions(currentVersion, versionInfo.latestVersion) < 0;

        return {
            supported: isSupported,
            forceUpdate: versionInfo.forceUpdate && !isSupported,
            updateAvailable,
            versionInfo,
        };
    }

    async updateVersion(
        platform: Platform,
        minimumVersion?: string,
        latestVersion?: string,
        forceUpdate?: boolean,
        updateMessage?: string,
        updateUrl?: string,
    ): Promise<AppVersion> {
        let version = await this.appVersionRepository.findOne({
            where: { platform },
        });

        if (!version) {
            version = this.appVersionRepository.create({ platform });
        }

        if (minimumVersion) version.minimumVersion = minimumVersion;
        if (latestVersion) version.latestVersion = latestVersion;
        if (forceUpdate !== undefined) version.forceUpdate = forceUpdate;
        if (updateMessage) version.updateMessage = updateMessage;
        if (updateUrl) version.updateUrl = updateUrl;

        const saved = await this.appVersionRepository.save(version);

        // Clear cache to force refresh
        this.versionCache.delete(platform);
        this.lastCacheUpdate = 0;

        this.logger.log(`Updated version for platform: ${platform}`);

        return saved;
    }

    clearCache(): void {
        this.versionCache.clear();
        this.lastCacheUpdate = 0;
    }
}