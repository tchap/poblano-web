var querystring = require('querystring');

var utils = require('./utils');

/**
 * Restrict path to particular roles users can be assigned to.
 */
exports.restrictTo = function(roles) {
  // 'authenticated' is a special case that always stays alone.
  if (roles === 'authenticated') return function (req, res, next) {
    if (req.isAuthenticated()) return next();
    else res.redirect('/login?returnTo=' + querystring.escape(req.url));
  };

 // The other roles can be ORed.
  if (!Array.isArray(roles)) roles = [roles];
  return function(req, res, next) {
    var assigned = function(role) {
      if (role === 'self') return (req.user._id.toString() === req.params.id);
      else return (role in req.user.roles);
    };

    for (i in roles) {
      if (assigned(roles[i])) {
        next();
        return;
      }
    }
    res.redirect(301, '/error/access-denied')
  }
}

/**
 * Set OAuth return path.
 */
exports.checkReturnTo = function(req, res, next) {
  var returnTo = req.query['returnTo'];
  if (returnTo) {
    req.session = req.session || {};
    req.session.returnTo = utils.getFullUrl(querystring.unescape(returnTo));
  }
  next();
}

/**
 * Make sure that the user account is complete.
*/
exports.ensureAccountComplete = function(req, res, next) {
  next();
}

module.exports = exports;
