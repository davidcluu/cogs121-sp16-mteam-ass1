var models = require("../models");

exports.view = function(req, res) {
  var user = req.user;
  if (user) {
    user = {
      username: user.username
    }
  }

  models.Comment
    .find()
    .sort('-posted')
    .exec(function(err, comments) {
      var data = {
        user: user,
        commentFeed : comments
      };
      res.render("index", data);
    });
};
