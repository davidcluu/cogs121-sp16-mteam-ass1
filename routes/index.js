var models = require("../models");

exports.view = function(req, res) {
  var user = req.user;
  if (user) {
    user = {
      username: user.username
    }
  }

  models.Thread
    .find()
    .sort('-posted')
    .exec(function(err, topics) {
      models.Comment
	  	.find()
	  	.exec(function(err, comments) {
	  	  var data = {
	  	  	user: user,
	  	  	topicFeed : topics,
	  	  	commentFeed: comments
	  	  }
	  	  res.render("index", data);
	  	});
    });


};
