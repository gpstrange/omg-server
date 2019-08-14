const Router = require('express').Router;
const router = Router();
const userCtrl = require('../controllers/user');

router.route('/login').post(userCtrl.login);
router.route('/signup').post(userCtrl.signup);

module.exports = router;
