const config = {
    API_PORT: process.env.API_PORT || 5000,
    MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017/omg',
    JWT_SECRET: process.env.JWT_SECRET || 'no_secret',
    JWT_PL_SECRET: process.env.JWT_PL_SECRET || 's3cr3t',
    JWT_SALT: process.env.JWT_SALT || 'tlas',
    SERVER_LOG_DIR: process.env.SERVER_LOG_FILE || './log',
};

module.exports = config;
