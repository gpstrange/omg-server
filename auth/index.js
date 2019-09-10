const crypto = require('crypto');
const IV_LENGTH = 16;
const jwt = require('jsonwebtoken');
const logger = require('../utils/log4js').getLogger('AUTH');
const ObjectId = require('mongodb').ObjectId;
const Errors = require('../errors');
const User = require('../models/user');

class JwtAuth {
    constructor(secrets) {
        this.jwtSecret = secrets.JWT_SECRET;
        const jwtPayLoadSecret = secrets.JWT_PL_SECRET;
        const jwtSalt = secrets.JWT_SALT;
        this.key = crypto.pbkdf2Sync(jwtPayLoadSecret, jwtSalt, 65536, 32, 'sha1');
    }

    encrypt(data, key) {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(data);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return Buffer.concat([iv, encrypted]).toString('base64');
    }

    decrypt(data, key) {
        const buff = new Buffer(data, 'base64');
        const iv = buff.slice(0, IV_LENGTH);
        const encryptedText = buff.slice(IV_LENGTH, buff.length);
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        const decrypted = decipher.update(encryptedText);
        return Buffer.concat([decrypted, decipher.final()]).toString();
    }

    decodeJwtToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, this.jwtSecret, (err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            });
        });
    }

    generateToken(user) {
        const expirationDate = new Date(new Date().getTime() + 300 * 24 * 60 * 60 * 1000);
        const payloadObj = {
            _id: user._id,
            username: user.username,
            groupId: user.groupId
        };
        const encryptedPayload = this.encrypt(JSON.stringify(payloadObj), this.key);

        return jwt.sign({
            sub: encryptedPayload,
            exp: expirationDate.getTime()
        }, this.jwtSecret);
    }

    async verify(jwtPayload, cb) {
        if (jwtPayload.exp < Date.now()) {
            return cb(Errors.tokenExpired());
        }

        let user;
        try {
            const decodedPayload = this.decrypt(jwtPayload.sub, this.key);
            user = JSON.parse(decodedPayload);
        } catch(e) {
            throw e;
        }
        let data;
        try {
            data = await User.findOne({ _id: ObjectId(user._id) }).exec();
        } catch(e) {
            return cb(e);
        }

        if (!data) {
            return cb(Errors.tokenExpired());
        }

        delete data.password;
        return cb(null, data);
    }
}

module.exports = JwtAuth;
