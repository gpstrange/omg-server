const passport = require('passport');
const passportJwt = require('passport-jwt');
const JwtStratagy = passportJwt.Strategy;
const extractJwt = passportJwt.ExtractJwt;
const JwtAuth = require('../auth');
const cls = require('../utils/cls');
const logger = require('../utils/log4js').getLogger('AUTH-MIDDLEWARE');
const Errors = require('../errors');

const jwtMiddleWate = (secrets) => {

    const authManager = new JwtAuth(secrets);
    const jwtStratagyOpts = {
        jwtFromRequest: extractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: secrets.JWT_SECRET
    }

    passport.use(new JwtStratagy(jwtStratagyOpts, authManager.verify.bind(authManager)));

    return (req, res, next) => {
        passport.authenticate('jwt', {session: false}, (err, data) =>{
            if (err) {
                logger.error(err);
                return next(err);
            }

            if (!data) {
                return next(Errors.tokenExpired());
            }

            req.user = data;
            cls.set('user', data);
            logger.debug('User autheticated');
            return next();
        })(req, res, next);
    };
}

module.exports = jwtMiddleWate;
