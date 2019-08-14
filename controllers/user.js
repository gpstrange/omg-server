const UserModel = require('../models/user');
const Auth = require('../auth');
const logger = require('../utils/log4js').getLogger('USER-CTRL');
const Errors = require('../errors');
const config = require('../config');
const secrets = {
    JWT_SECRET: config.JWT_SECRET,
    JWT_PL_SECRET: config.JWT_PL_SECRET,
    JWT_SALT: config.JWT_SALT
};
const auth = new Auth(secrets);
const bcrypt = require('bcrypt');
const SALT_FACTOR = 10;

class User {
    constructor(obj) {
        Object.assign(this, obj);
    }

    static async encryptPassword(password) {
        let salt = await bcrypt.genSalt(SALT_FACTOR);
        return bcrypt.hash(password, salt);
    }

    async comparePassword(password) {
        return bcrypt.compare(password, this.password);
    }
}

module.exports.login = async (req, res, next) => {
    if (!req.body.name || !req.body.password) {
        return next(Errors.invalidRequest('Username and password is required'));
    }
    logger.debug(`Login request by user ${req.body.name}`);

    let user;
    try {
        user = await UserModel.findOne({username: String(req.body.name)}).lean().exec();
    } catch (e) {
        return next(e);
    }

    if (!user) {
        return next(Errors.invalidLogin());
    }

    user = new User(user);

    let isMatch = false;
    try {
        isMatch = await user.comparePassword(String(req.body.password));
    } catch (e) {
        return next(e);
    }

    if (!isMatch) {
        return next(Errors.invalidLogin('Wrong password'));
    }

    let token = auth.generateToken(user);
    logger.debug('Generated token for user ' + user._id);
    return res.json({
        status: 'ok',
        token: token,
        user
    });
};

module.exports.signup = async (req, res, next) => {
    if (!req.body.name || !req.body.password) {
        return next(Errors.invalidRequest('Username and password is required'));
    }
    logger.debug(`Login request by user ${req.body.name}`);

    let user;
    try {
        user = await UserModel.findOne({username: String(req.body.name)}).exec();
    } catch (e) {
        return next(e);
    }

    if (user) {
        return next(Errors.userAlreadyRegistered('Username already taken'));
    }

    try {
        const password = await User.encryptPassword(String(req.body.password));

        user = new UserModel({
            username: String(req.body.name),
            password
        });
        await user.save();
    } catch (e) {
        return next(e);
    }

    let token = auth.generateToken(user);
    logger.debug('Generated token for user ' + user._id);
    return res.json({
        status: 'ok',
        token: token
    });
};