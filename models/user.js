//
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    password: {type: String},
    logoutNum: {type: Number},
    groupId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'group'
    },
    createdAt: Date
  }, { timestamps: true });

userSchema.pre('save', function(next) {
    this.createdAt = new Date();
    return next();
});

const User = mongoose.model('user', userSchema);
module.exports = User;
