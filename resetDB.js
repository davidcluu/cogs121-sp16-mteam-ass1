var mongoose = require("mongoose");
var models = require('./models');

/**
 * Connect to the database
 */
var db = mongoose.connection;
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://127.0.0.1/cogs121');
db.on('error', console.error.bind(console, 'Mongo DB Connection Error:'));
db.once('open', function(callback) {
    console.log("Database connected successfully.");
});

/**
 * Reset database contents
 */
var threadDone = false;
var commentDone = false;
function tryClose () {
  if (threadDone && commentDone) {
    console.log("Done!");
    mongoose.connection.close();
  }
}

models.Thread
  .find()
  .remove()
  .exec(function (){
    threadDone = true;
    tryClose();
  });

models.Comment
  .find()
  .remove()
  .exec(function (){
    commentDone = true;
    tryClose();
  });
