const app = require('./app');
const mongoose = require('mongoose');
const logger = require('./utils/log4js').getLogger('SERVER');

const server = app.listen(app.get('port'), () => {
    logger.info('server listening in port '+  app.get('port'));
});

process.on('SIGINT', () => {
    logger.info('shutting down server');
    server.close();
});

server.on('close', () => {
    logger.debug('Closing server');
    mongoose.disconnect();
});
