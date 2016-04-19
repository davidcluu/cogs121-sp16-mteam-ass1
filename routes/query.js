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
        if (err) console.log(err);

        res.json(comments);
      });
  }
};

exports.deleteComment = function(req, res) {
  models.Comment
    .find(req.body)
    .remove()
    .exec(function(err) {
      if (err) console.log(err);
      
      res.sendStatus(200);
    });
};
