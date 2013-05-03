var express  = require('express')
  , http     = require('http')
  , path     = require('path')
  , passport = require('passport')
  , config   = require('./config')

var app = express();

app.configure(function () {
  app.set('host', config.HTTP_HOST);
  app.set('port', config.HTTP_PORT);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('prefix', config.HTTP_PATH_PREFIX)
  if (config.HTTP_PROXY_ENABLED) {
    app.enable('trust proxy');
  }
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: config.SESSION_SECRET }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

/**
 * Passport Setup - GitHub Strategy
 */
var GitHubStrategy = require('passport-github').Strategy
  , User = new config.strategy['User'](config);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GitHubStrategy({
    clientID:      config.GITHUB_CLIENT_ID,
    clientSecret:  config.GITHUB_CLIENT_SECRET,
    callbackURL:   config.HTTP_FORWARDED_HOST
		 + config.HTTP_PATH_PREFIX
		 + '/auth/github/callback',
    customHeaders: {
      'User-Agent': 'Salsita Poblano'
    }
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ id: profile.id, profile: profile }, function(err, user) {
      done(err, user);
    });
  }
));

app.configure('development', function () {
  app.use(express.errorHandler());
});

/**
 * Paths
 */
var site = require('./routes/site')
  , user = require('./routes/user')
  , project = require('./routes/project')

// General 
app.get('/login', site.login);
app.get('/', ensureAuthenticated, site.index);
app.get('/admin', ensureAuthenticated, restrictTo('admin'), site.admin);

// User
app.get('/user/:id', ensureAuthenticated, restrictTo('self'), user.profile);

// Project
app.get('/project/initialise', ensureAuthenticated, project.initialise);

// Authentication
app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback',
  passport.authenticate('github', { successRedirect: '/',
                                    failureRedirect: '/login'}));

/**
 * Listen and Serve
 */
http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});

/**
 * Middleware
 */
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated())
    return next();
  else
    res.redirect('/login');
}

function restrictTo(role) {
  return function(req, res, next) {
    next();
  }
}
