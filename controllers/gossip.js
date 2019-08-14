const Like = require('../models/like');
const Gossip = require('../models/gossip');
const logger = require('../utils/log4js').getLogger('GOSSIP-CTRL');
const Errors = require('../errors');
const ObjectId = require('mongodb').ObjectId;

module.exports.getGossip = async (req, res, next) => {
    if (!req.params.groupId) {
        return next(Errors.invalidRequest('Group not selected'));
    }

    let gossips;
    try {
        gossips = await Gossip.find({groupId: ObjectId(req.params.groupId)}).lean().exec();
        const gossipIds = gossips.map((g) => g._id);

        const likes = await Like.find({userId: req.user._id, gossipId: { $in: gossipIds}}).lean().exec();
        const likedIds = likes.map((like) => String(like.gossipId));

        gossips.forEach((gossip) => {
            if (likedIds.includes(String(gossip._id))) {
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

    let gp;
    try {
        gp = await Gossip.findOneAndUpdate(
            {_id: ObjectId(req.body.gossipId)},
            {$inc: {likesNumber: 1}}
        ).exec();

        const like = new Like({
            gossipId: ObjectId(req.body.gossipId),
            userId: req.user._id
        });
        await like.save();
    } catch(e) {
        return next(e);
    }

    return res.json({status: 'Success', gossip: gp});
};

module.exports.unlikeGossip = async (req, res, next) => {
    if (!req.body.gossipId) {
        return next(Errors.invalidRequest('Invalid Gossip'));
    }

    let gp;
    try {
        gp = await Gossip.findOneAndUpdate(
            {_id: ObjectId(req.body.gossipId)},
            {$inc: {likesNumber: -1}}
        ).exec();

        await Like.remove({userId: req.user._id, gossipId: ObjectId(req.body.gossipId)});
    } catch(e) {
        return next(e);
    }

    return res.json({status: 'Success', gossip: gp});
};
