const mongoose = require('mongoose');
const cls = require('../utils/cls');

const groupSchema = new mongoose.Schema({
    name: String,
    createdAt: Date,
    createdBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'user'
    }
  }, { timestamps: true });

groupSchema.pre('save', function(next) {
    const user = cls.get('user');
    this.createdAt = new Date();
    this.createdBy = user._id;
    return next();
});

const group = mongoose.model('group', groupSchema);
module.exports = group;
