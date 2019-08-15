const Router = require('express').Router;
const router = Router();
const userCtrl = require('../controllers/user');

router.route('/login').post(userCtrl.login);
router.route('/signup').post(userCtrl.signup);
router.route('/exit-group').post(userCtrl.exitGroup);

module.exports = router;
