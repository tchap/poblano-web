/**
 * Backend Setup - User Strategy
 */
var Backend = require('./lib/Backend').Backend
  , Config  = require('./config')
  , backend = new Backend(Config);

/**
 * Express Setup
 */
var express  = require('express')
  , http     = require('http')
  , path     = require('path')
  , passport = require('passport')

var app = express();

app.configure(function () {
  app.set('host', Config.HTTP_HOST);
  app.set('port', Config.HTTP_PORT);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('prefix', Config.HTTP_PATH_PREFIX)
  if (Config.HTTP_PROXY_ENABLED) {
    app.enable('trust proxy');
  }
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: Config.SESSION_SECRET }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(function(req, res, next) {
    req._backend = backend;
    next();
  });
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

/**
 * Passport Setup - GitHub Strategy
 */
var GitHubStrategy = require('passport-github').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  backend.users.findOneById(id, done);
});

passport.use(new GitHubStrategy({
    clientID:      Config.GITHUB_CLIENT_ID,
    clientSecret:  Config.GITHUB_CLIENT_SECRET,
    callbackURL:   Config.HTTP_FORWARDED_HOST
                 + Config.HTTP_PATH_PREFIX
                 + '/auth/github/callback',
    customHeaders: {
      'User-Agent': 'Salsita Poblano'
    },
    passReqToCallback: true,
  },
  // XXX: Use state to prevent CSRF
  function(req, accessToken, refreshToken, profile, done) {
    var state = req.query['state'];
    // XXX: Call done?
    if (!state) throw new Error('GitHub OAuth is missing the state paremeter.');

//    if (state in global.stateCallbacks) global.stateCallbacks[state](profile);
    backend.users.findOneByServiceId('github', profile.id, done);
  }
));

app.configure('development', function () {
  app.use(express.errorHandler());
});

/**
 * Paths
 */
var mw = require('./lib/middleware.js');

var site = require('./routes/site')
  , admin = require('./routes/admin')
  , user = require('./routes/user')
  , project = require('./routes/project')
  , error = require('./routes/error');

// General 
app.get('/login', site.login);
app.get('/logout', site.logout);

app.get('/', mw.restrictTo('authenticated'),
             mw.ensureAccountComplete,
             site.dashboard);

// Project
app.get('/project/initialise', mw.restrictTo('authenticated'),
                               mw.ensureAccountComplete,
                               project.initialise);

// Admin
app.get('/admin', mw.restrictTo('authenticated'),
                  mw.ensureAccountComplete,
                  mw.restrictTo('admin'),
                  admin.index);
app.post('/admin/invite-user', mw.restrictTo('authenticated'),
                               mw.ensureAccountComplete,
                               mw.restrictTo('admin'),
                               admin.invite);

// User
app.get('/user/:id', mw.restrictTo('authenticated'),
                     mw.ensureAccountComplete,
                     mw.restrictTo(['self', 'admin']),
                     user.profile);
app.get('/user/:id/auth/connect/github', function(req, res, next) {
  console.log(req);
  next();
});

// Invitations
app.get('/invitation/:id', user.invitation);

// Authentication
// XXX: Use connect-ensure-login
app.get('/auth/github', mw.checkReturnTo, passport.authenticate('github', {state: 'Bublifuk'}));
app.get('/auth/github/callback',
  passport.authenticate('github', { successReturnToOrRedirect: '/',
                                    failureRedirect: '/error/account-not-found'}));

// Errors
app.get('/error/account-not-found', error.accountNotFound);
app.get('/error/access-denied', error.accessDenied);
app.get('/error/internal-server-error', error.internalServerError);

/**
 * Listen and Serve
 */
http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});
