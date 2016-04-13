/**
 * Load dependencies
 */
var mongoose = require('mongoose')
  , Schema   = mongoose.Schema;


/**
 * Schema
 */
var UserSchema = new Schema({
  'twitterID': String,
  'token': String,
  'username': String,
  'displayName': String,
  'photo': String
});

var ThreadSchema = new Schema({
  'user': String,
  'topic': String,
  'posted': { type: Date, default: Date.now() }
});

var CommentSchema = new Schema({
  'user': String,
  'videoUrl': String,
  'videoCaption': String,
  'posted': { type: Date, default: Date.now() }
});


/**
 * Models
 */
exports.User = mongoose.model('User', UserSchema);
exports.Thread = mongoose.model('Thread', ThreadSchema);
exports.Comment = mongoose.model('Comment', CommentSchema);

