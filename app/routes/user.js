var querystring = require('querystring');

var utils = require('../lib/utils');

exports.profile = function (req, res) {
  req.user.displayName = req.user.displayName || req.user.username;
  var context = {
    title: req.user.username + ' - Profile',
    prefix: req.app.get('prefix'),
    user: req.user,
    url: req.url,
  };
  res.render('user/profile', context);
};

exports.invitation = function (req, res, next) {
  req._backend.users.findOneByInvitationId(req.params.id,
    function(err, user) {
      console.log(user);
      if (err) return next(err);
      else if (user) {
        req.login(user, function(err) {
          if (err) return next(err);
          return res.redirect('/user/' + user._id);
        });
      }
      else return res.redirect(301, '/error/access-denied');
    });
};
