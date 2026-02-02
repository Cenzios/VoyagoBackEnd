import * as Joi from 'joi';

export const validationSchema = Joi.object({
    NODE_ENV: Joi.string()
        .valid('local', 'development', 'production')
        .default('development'),
    PORT: Joi.number().default(3000),
    API_PREFIX: Joi.string().default('api/v1'),

    JWT_SECRET: Joi.string().required(),
    JWT_EXPIRATION: Joi.string().default('3600'),

    THROTTLE_TTL: Joi.number().default(60),
    THROTTLE_LIMIT: Joi.number().default(100),

    WEB_BASE_URL: Joi.string().required(),
    BACKEND_URL: Joi.string().required(),

    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().default(5432),
    DB_USERNAME: Joi.string().required(),
    DB_PASSWORD: Joi.string().required(),
    DB_DATABASE: Joi.string().required(),
    DB_SYNCHRONIZE: Joi.boolean().default(false),
    DB_LOGGING: Joi.boolean().default(false),

    MAIL_MAILER: Joi.string().default('smtp'),
    MAIL_HOST: Joi.string().required(),
    MAIL_PORT: Joi.number().required(),
    MAIL_USERNAME: Joi.string().required(),
    MAIL_PASSWORD: Joi.string().required(),
    MAIL_ENCRYPTION: Joi.string().default('tls'),
    MAIL_FROM_ADDRESS: Joi.string().required(),
    MAIL_FROM_NAME: Joi.string().required(),

    LOKI_URL: Joi.string().required(),
    LOKI_USER: Joi.string().required(),
    LOKI_API_KEY: Joi.string().required(),
});