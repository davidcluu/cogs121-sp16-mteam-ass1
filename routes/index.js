var models = require("../models");

exports.view = function(req, res) {
  models.Comment
    .find()
    .sort('-posted')
    .exec(function(err, comments) {
      console.log(comments);
      var feed = {topicFeed : topics, commentFeed : comments};
      res.render("index", feed);
    });
};
