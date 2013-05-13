/**
 * GET
 */

exports.index = function(req, res) {
  fillMinimalUser(req.user);

  req._backend.users.find({}, function(err, users) {
    if (err) res.redirect(301, '/error/internal-server-error');
    else {
      var context = {
        title: 'Admin',
        prefix: req.app.get('prefix'),
        user: req.user,
        users: users,
      };
      res.render('admin/index', context);
    }
  });
};

/**
 * POST
 */
var Config = require('../config');

var crypto = require('crypto')
  , email = require('emailjs')
  , format = require('util').format;

exports.invite = function(req, res) {
  var profile = {
    name: req.body.user.name,
    email: req.body.user.email,
    status: 'Invited',
    roles: {},
  };

  if (req.body.user.admin == 'true') profile.roles.admin = true;

  crypto.randomBytes(32, function(err, buf) {
    if (err) {
      res.redirect('/error/internal-server-error');
      return;
    }
    profile.invitationToken = buf.toString('hex');

    req._backend.users.create(profile, function(err, user) {
      if (err) res.redirect('/error/internal-server-error');
      else {
        var server  = email.server.connect({
          user:     Config.SMTP_USERNAME, 
          password: Config.SMTP_PASSWORD, 
          host:     Config.SMTP_HOST, 
          ssl:      Config.SMTP_SSL,
        });
        var invitationURL = format('%s%s/user/%s?token=%s',
          Config.HTTP_FORWARDED_HOST, req.app.get('prefix'), user._id,
          profile.invitationToken);
        var msg = format("You have been invited to join Poblano! " +
                         "Visit %s and fill in your profile!", invitationURL);
        server.send({
          text: msg,
          from: Config.SMTP_FROM,
          to: req.body.user.email,
          subject: "You have been invited to join Poblano!"
        }, function(err, message) {
          if (err) {
            console.log(err);
            res.redirect('/error/internal-server-error');
          }
          else res.redirect('/admin')
        })
      }
    });
  });
};

module.exports = exports;

/**
 * Helpers
 */

function fillMinimalUser(user) {
  user.name  = user.name  || "";
  user.roles = user.roles || {};
}
