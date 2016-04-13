var models = require("../models");

exports.view = function(req, res) {
  models.Comment
    .find()
    .exec(function(err, comments) {
      console.log(comments);
      var commentFeed = {commentFeed : comments};
      res.render("index", commentFeed);
    });
};
