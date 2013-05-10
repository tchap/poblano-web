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
 * Backend Setup - User Strategy
 */
var backends = require('./lib/Backends')
  , backend;
if (config.MONGODB_ENABLED) {
  backend = new backends.MongoDBBackend(config);
}
else {
  backend = new backends.SimpleBackend(config);
}

/**
 * Passport Setup - GitHub Strategy
 */
var GitHubStrategy = require('passport-github').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  backend.users.findById(id, function(err, user) {
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
    backend.users.createFromServiceId({githubId: profile.id, githubProfile: profile},
      function(err, user) {
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
  , error = require('./routes/error');

// General 
app.get('/login', site.login);

app.get('/', ensureAuthenticated, site.dashboard);
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

// Errors
app.get('/error/account-not-found', error.accountNotFound);
app.get('/error/access-denied', error.accessDenied);

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
  if (role === 'self')
    return function (req, res, next) {
      if (req.user.id === parseInt(req.params.id))
        next();
      else
        res.redirect(301, '/error/access-denied');
    }
  return function(req, res, next) {
    if (role in req.user.roles)
      next();
    else
      res.redirect(301, '/error/access-denied');
  }
}
