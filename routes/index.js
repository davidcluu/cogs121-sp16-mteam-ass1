var models = require("../models");

exports.view = function(req, res) {
  var user;
  if (req.user) {
    user = {
      username: req.user.username
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
