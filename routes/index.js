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
  	  var data = {
  	  	user: user,
  	  	topicFeed : topics
  	  }
  	  res.render("index", data);
    });

};
