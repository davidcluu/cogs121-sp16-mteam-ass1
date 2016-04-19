var models = require("../models");

exports.view = function(req, res) {
  var user = req.user;
  if (user) {
    user = {
      username: user.username,
      displayName: user.displayName
    }
  }

  models.Thread
    .find()
    .sort('-posted')
    .exec(function(err, topics) {
      models.Thread
        .find()
        .sort('-count')
        .exec(function(err, topics2) {
          var data = {
            user: user,
            topicFeed : topics,
            topicFeedSorted : topics2
          }
          res.render("index", data);
        });
    });

};
