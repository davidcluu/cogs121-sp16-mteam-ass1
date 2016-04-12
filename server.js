// Node.js Dependencies
var express = require("express");
var handlebars = require("express-handlebars");
var mongoose = require("mongoose");

const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);

const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo/es5")(session);

if (!process.env.SESSION_SECRET) {
  require("dotenv").load();
}
var models = require("./models");

var passport = require("passport");

var router = {
  index: require("./routes/index"),
  auth: {
    twitter: {
      auth: passport.authenticate('twitter'),
      callback: passport.authenticate('twitter', { successRedirect: '/', failureRedirect: '/' })
    },
    logout: function(req, res) {
      req.logout();
      res.redirect('/');
    }
  }
};

var parser = {
  body: require("body-parser"),
  cookie: require("cookie-parser")
};

var strategy = {
  "Twitter": require("passport-twitter").Strategy
};

// Database Connection
var db = mongoose.connection;
mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://127.0.0.1/cogs121');
db.on('error', console.error.bind(console, 'Mongo DB Connection Error:'));
db.once('open', function(callback) {
    console.log("Database connected successfully.");
});

// session middleware
var session_middleware = session({
  key: "session",
  secret: process.env.SESSION_SECRET,
  saveUninitialized: true,
  resave: true,
  store: new MongoStore({ mongooseConnection: db })
});

// Middleware
app.set("port", process.env.PORT || 3000);
app.engine('html', handlebars({ defaultLayout: 'layout', extname: '.html' }));
app.set("view engine", "html");
app.set("views", __dirname + "/views");
app.use(express.static(path.join(__dirname, "public")));
app.use(parser.cookie());
app.use(parser.body.urlencoded({ extended: true }));
app.use(parser.body.json());
app.use(require('method-override')());
app.use(session_middleware);

/* Passport Middleware */
app.use(passport.initialize());
app.use(passport.session());

/* Use Twitter Strategy for Passport */
passport.use(new strategy.Twitter({
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  callbackURL: "/auth/twitter/callback"
}, function(token, token_secret, profile, done) {
  models.User
  .findOne({"twitterID": profile.id}, function(err,user){
    // (1) Check if there is an error. If so, return done(err);
    if (err) return done(err);

    if(!user) {
      // (2) since the user is not found, create new user.
      // Refer to Assignment 0 to how create a new instance of a model
      var newUser = new models.User({
        'twitterID': profile.id,
        'token': token,
        'username': profile.username,
        'displayName': profile.displayName,
        'photo': profile.photos[0]
      });
      newUser.save(function(err, user) {
        if(err) console.log(err);
      });

      return done(null, profile);
    }
    else {
      // (3) since the user is found, update user’s information
      process.nextTick(function() {
        user.twitterID = profile.id;
        user.token = token;
        user.username = profile.username;
        user.displayName = profile.displayName;
        user.photo = profile.photos[0];

        user.save();

        return done(null, profile);
      });
    }
  })
}));

/* Passport Serialization */
passport.serializeUser(function(user, done) {
  done(null, user);
});
passport.deserializeUser(function(user, done) {
  done(null, user);
});

// Routes
app.get("/", router.index.view);

app.get('/auth/twitter', router.auth.twitter.auth);
app.get('/auth/twitter/callback', router.auth.twitter.callback);
app.get('/logout', router.auth.logout);

io.use(function(socket, next) {
  session_middleware(socket.request, {}, next);
});

io.on('connection', function(socket){
  console.log('user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
})

// Start Server
http.listen(app.get("port"), function() {
  console.log("Express server listening on port " + app.get("port"));
});
