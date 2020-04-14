const mongoose = require('mongoose');
const { Schema } = mongoose;

const Write = new Schema({
  title: String,
  content: String,
  author: String,
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

Write.statics.loadPost = function(id) {
  return this.findById(id).exec();
}

Write.statics.loadPosts = function() {
  return this.find()
    .sort({ _id: -1 })
    .limit(10)
    .lean()
    .exec();
}

Write.statics.postRegister = function({ title, content, author }) {
  const write = new this({
    title,
    content,
    author
  });

  return write.save();
}

module.exports = mongoose.model('Write', Write);