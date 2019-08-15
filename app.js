const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('./config');
const routes = require('./routes');
const logger = require('./utils/log4js').getLogger('APP');
const log4js = require('log4js');
const Errors = require('./errors');
const OMGError = require('./errors/error');
const mongoose = require('mongoose');
const cls = require('./utils/cls');

app.set('port', config.API_PORT);
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));

if (process.env.NODE_ENV !== 'PRODUCTION') {
    const cors = require('cors');
    const whiteList = ['http://www.ohmygossip.in', 'http://ohmygossip.in', 'http://139.59.85.39:8080'];

    const corsOptions = {
        origin: (origin, cb) => {
            if (!origin || whiteList.indexOf(origin) !== -1) {
                return cb(null, true);
            } else {
                return cb(new Error('invalid url'));
            }
        },
        credentials: true
    };
    app.use(cors(corsOptions));
}

process.on('uncaughtException', err => {
    logger.error(err.message);
    logger.error(err.stack);
    process.exit(1);
});

process.on('unhandledRejection', err => {
    logger.error(err.message);
    logger.error(err.stack);
    process.exit(1);
});

app.use(
    log4js.connectLogger(logger, {
        level: 'auto',
        format: `:remote-addr - ":method :url HTTP/:http-version" :status :content-length ":referrer" ":user-agent"`
    })
);

app.use(cls.middleware);

mongoose.Promise = Promise;
mongoose.connect(config.MONGO_URL, {useNewUrlParser: true}).then(() => {
    logger.info('Connected to mongo');
}).catch((err) => {
    logger.error('MongoDB connection error. Please make sure MongoDB is running. ');
    process.exit();
});

routes(app);

app.use((req, res, next) => {
    return next(Errors.notFound());
});

app.use((err, req, res, next) => {
    if (!err) {
        return next();
    }
    logger.error(err);
    if (!(err instanceof OMGError)) {
        return next(err);
    }

    return res.status(err.statusCode).send({
        message: err.message,
        code: err.code
    });
});

module.exports = app;
