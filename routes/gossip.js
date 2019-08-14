const Router = require('express').Router;
const router = Router();
const gossipCtrl = require('../controllers/gossip');

router.route('/get-gossip/:id').get(gossipCtrl.getGossip);
router.route('/like-gossip').post(gossipCtrl.likeGossip);
router.route('/unlike-gossip').post(gossipCtrl.unlikeGossip);

module.exports = router;
