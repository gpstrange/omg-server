const logger = require('../utils/log4js').getLogger('ROUTES');
const jwtAuthMiddleware = require('../middlewares/auth');
const config = require('../config');

const secrets = {
    JWT_SECRET: config.JWT_SECRET,
    JWT_PL_SECRET: config.JWT_PL_SECRET,
    JWT_SALT: config.JWT_SALT
};

const jwtMiddleware = jwtAuthMiddleware(secrets);

const routes = (app) => {
    const authRouteFilter = new RegExp('' +
        new RegExp('^(?!^/api\/v\\d+\/login(\/)?$)').source +
        new RegExp('^(?!^/api\/v\\d+\/signup(\/)?$)').source
    );

    app.use(authRouteFilter, jwtMiddleware);

    app.use('/api/v1/', require('./user'));
    app.use('/api/v1/', require('./gossip'));
    app.use(require('./model-routes'));
    logger.debug('Initialized all routes');
};

module.exports = routes;