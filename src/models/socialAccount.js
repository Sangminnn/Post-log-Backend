const mongoose = require('mongoose');
const { Schema } = mongoose;
const { generateToken } = require('lib/token');

const SocialAccount = new Schema({
  // email: String,
  // profile: {
  //   username: String,
  //   thumbnail: { type: String, default: '/static/images/default_thumbnail.png' },
  // },
  sid: String,
  name: String,
  profile: {
    username: String,
  },
  accessToken: String,
  provider: String,
  createdAt: { type: Date, default: Date.now }
});

SocialAccount.statics.findBySocialId = function(id) {
  return this.findOne({'sid': id}).exec();
};

SocialAccount.statics.findByUsername = function(username) {
  return this.findOne({'profile.username': username}).exec();
};

SocialAccount.statics.socialRegister = function({socialName, email, socialId, provider, accessToken, id}) {
  console.log(id);
  const account = new this({
    sid: id,
    name: socialName,
    email,
    profile: {
      username: socialId
    },
    provider,
    accessToken
  });

  return account.save();
};

SocialAccount.methods.generateToken = function() {
  const payload = {
    _id: this._id,
    profile: this.profile
  }
  console.log(payload);

  return generateToken(payload, 'account');
}

module.exports = mongoose.model('SocialAccount', SocialAccount);