import pino from 'pino';
import LokiTransport from 'pino-loki';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

const transport = LokiTransport({
    host: configService.get<string>('loki.url') || '',
    basicAuth: {
        username: configService.get<string>('loki.username') || '',
        password: configService.get<string>('loki.apiKey') || '',
    },
    labels: {
        app: 'nestjs-api',
        environment: process.env.NODE_ENV || 'production',
    },
    batching: {
        interval: 5,
    },
});

export const logger = pino({
    level: 'info',
    redact: {
        paths: [
            'req.headers.authorization',
            'req.body.password',
            'req.body.token',
            'req.body.refreshToken',
        ],
        censor: '[REDACTED]',
    },
}, transport);
