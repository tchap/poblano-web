var express  = require('express')
  , http     = require('http')
  , path     = require('path')
  , passport = require('passport');

var app = express();

app.configure(function () {
  app.set('host', process.env.POBLANO_HOST || 'http://localhost');
  app.set('port', process.env.POBLANO_PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('prefix', process.env.POBLANO_PREFIX || '')
  if (process.env.POBLANO_ENABLE_PROXY) {
    app.enable('trust proxy');
  }
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

/**
 * Passport Setup - GitHub Strategy
 */
var GITHUB_CLIENT_ID      = process.env.POBLANO_GITHUB_CLIENT_ID
  , GITHUB_CLIENT_SECRET  = process.env.POBLANO_GITHUB_CLIENT_SECRET
  , GITHUB_OAUTH_CALLBACK = process.env.POBLANO_GITHUB_OAUTH_CALLBACK;

if (!GITHUB_CLIENT_ID) {
  throw new Error("POBLANO_GITHUB_CLIENT_ID not set")
}
if (!GITHUB_CLIENT_SECRET) {
  throw new Error("POBLANO_GITHUB_CLIENT_SECRET not set")
}
if (!GITHUB_OAUTH_CALLBACK) {
  throw new Error("POBLANO_GITHUB_OAUTH_CALLBACK not set")
}

var GitHubStrategy = require('passport-github').Strategy
  , SimpleUser = require('./lib/SimpleUser')
  , User = new SimpleUser();

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new GitHubStrategy({
    clientID:     GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL:  GITHUB_OAUTH_CALLBACK
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
