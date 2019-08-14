const Like = require('../models/like');
const Gossip = require('../models/gossip');
const logger = require('../utils/log4js').getLogger('GOSSIP-CTRL');
const Errors = require('../errors');

module.exports.getGossip = async (req, res, next) => {
    if (!req.params.groupId) {
        return next(Errors.invalidRequest('Group not selected'));
    }

    let gossips;
    try {
        gossips = await Gossip.find({groupId: ObjectId(req.params.groupId)}).exec();
        const gossipIds = gossips.map((g) => g._id);

        const likes = Like.find({userId: req.user._id, gossipId: { $in: gossipIds}}).exec();
        const likedIds = likes.map((like) => like.gossipId);

        gossips.forEach((gossip) => {
            if (likedIds.includes(gossip._id)) {
                gossip.userLiked = true;
            }
        })

    } catch(e) {
        return next(e);
    }

    return res.json(gossips);
};

module.exports.likeGossip = async (req, res, next) => {
    if (!req.body.gossipId) {
        return next(Errors.invalidRequest('Invalid Gossip'));
    }

    let gossips;
    try {
        await Gossip.findOneAndUpdate(
            {gossipId: ObjectId(req.body.gossipId)},
            {likesNumber: { $inc: 1}}
        ).exec();

        const like = new Like({
            gossipId: ObjectId(req.body.gossipId),
            userId: req.user._id
        });
        await like.save();
    } catch(e) {
        return next(e);
    }

    return res.json({status: 'Success'});
};

module.exports.unlikeGossip = async (req, res, next) => {
    if (!req.body.gossipId) {
        return next(Errors.invalidRequest('Invalid Gossip'));
    }

    try {
        await Gossip.findOneAndUpdate(
            {gossipId: ObjectId(req.body.gossipId)},
            {likesNumber: { $inc: -1}}
        ).exec();

        await Like.remove({userId: req.user._id, gossipId: ObjectId(req.body.gossipId)});
    } catch(e) {
        return next(e);
    }

    return res.json({status: 'Success'});
};
