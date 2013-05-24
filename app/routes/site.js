var querystring = require('querystring');

exports.login = function (req, res) {
  var context = {
    title: 'Welcome!',
    prefix: req.app.get('prefix'),
    user: req.user,
    returnTo: querystring.escape(req.query['returnTo']),
  };
  res.render('site/login', context);
};

exports.logout = function(req, res) {
  req.logout();
  res.redirect('/');
};

exports.dashboard = function (req, res) {
  fillMinimalUser(req.user);

  var context = {
    title: 'Dashboard',
    prefix: req.app.get('prefix'),
    user: req.user
  };
  res.render('site/dashboard', context)
};

module.exports = exports;

/**
 * Helpers
 */

function fillMinimalUser(user) {
  user.name  = user.name  || "";
  user.roles = user.roles || {};
}
