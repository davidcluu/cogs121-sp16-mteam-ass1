var models = require("../models");

exports.queryComments = function(req, res) {
  var threadName = req.query.threadName;

  if (!threadName) {
    res.json([]);
  }
  else {
    models.Comment
    .find({
      'threadName' : threadName
    })
    .exec(function(err, comments) {
      res.json(comments);
    });
  }

};
