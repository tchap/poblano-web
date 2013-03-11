var express = require('express')
  , http    = require('http')
  , path    = require('path')
  , passport = require('passport')
  , GoogleStrategy = require('passport-google').Strategy;

var SimpleUser = require('./lib/SimpleUser'),
	User = new SimpleUser();

passport.serializeUser(function(user, done) {
  console.log('SERIALIZE');
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log('DESERIALIZE');
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
	returnURL: 'http://localhost:3000/auth/google-openid/return',
    realm: 'http://localhost:3000'
  },
  function(identifier, profile, done) {
    console.log('OPENID');
    User.create({ openId: identifier, profile: profile }, function(err, user) {
      done(err, user);
    });
  }
));

var routes = require('./routes');

var app = express();

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'hbs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

app.get('/', routes.index);

app.get('/auth/google-openid', passport.authenticate('google'));
app.get('/auth/google-openid/return',
  passport.authenticate('google', { successRedirect: '/',
                                    failureRedirect: '/'}));

http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});
