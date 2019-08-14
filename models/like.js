const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    gossipId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'gossip'
    },
    createdAt: Date,
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user'
    }
  }, { timestamps: true });

likeSchema.pre('save', function(next) {
    this.createdAt = new Date();
    return next();
});

const like = mongoose.model('like', likeSchema);
module.exports = like;
