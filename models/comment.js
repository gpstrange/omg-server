const mongoose = require('mongoose');
const cls = require('../utils/cls');

const commentSchema = new mongoose.Schema({
    name: String,
    gossipId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'gossip'
    },
    createdAt: Date,
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user'
    },
    username: String,
    message: String
  }, { timestamps: true });

commentSchema.pre('save', function(next) {
    const user = cls.get('user');
    this.createdAt = new Date();
    this.username = user.username;
    this.userId = user._id;
    return next();
});

const comment = mongoose.model('comment', commentSchema);
module.exports = comment;
