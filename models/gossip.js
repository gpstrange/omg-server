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
    likesNumber: Number
  }, { timestamps: true });

gossipSchema.pre('save', function(next) {
    const user = cls.get('user');
    this.createdAt = new Date();
    this.createdBy = user._id;
    return next();
});

const gossip = mongoose.model('gossip', gossipSchema);
module.exports = gossip;
