export default () => ({
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || 'api/v1',

    jwt: {
        secret: process.env.JWT_SECRET,
        expirationTime: process.env.JWT_EXPIRATION || '3600',
    },

    throttle: {
        ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
        limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
    },

    web: {
        baseUrl: process.env.WEB_BASE_URL,
    },

    backend: {
        url: process.env.BACKEND_URL,
    },

    database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
        logging: process.env.DB_LOGGING === 'true',
        ssl: process.env.DB_SSL === 'true',
    },


    mail: {
        mailer: process.env.MAIL_MAILER || 'smtp',
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT || '587', 10),
        username: process.env.MAIL_USERNAME,
        password: process.env.MAIL_PASSWORD,
        encryption: process.env.MAIL_ENCRYPTION || 'tls',
        fromAddress: process.env.MAIL_FROM_ADDRESS,
        fromName: process.env.MAIL_FROM_NAME,
    },

    loki: {
        url: process.env.LOKI_URL,
        username: process.env.LOKI_USER,
        apiKey: process.env.LOKI_API_KEY,
    },
});