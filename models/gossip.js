const mongoose = require('mongoose');
const cls = require('../utils/cls');

const gossipSchema = new mongoose.Schema({
    name: String,
    groupId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'group'
    },
    createdAt: Date,
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user'
    },
    username: String,
    likesNumber: {type: Number, default: 0},
    message: String
  }, { timestamps: true });

gossipSchema.pre('save', function(next) {
    if (this.isNew) {
        this.likesNumber = 0;
    }
    const user = cls.get('user');
    this.createdAt = new Date();
    this.userId = user._id;
    this.username = user.username;
    return next();
});

const gossip = mongoose.model('gossip', gossipSchema);
module.exports = gossip;
