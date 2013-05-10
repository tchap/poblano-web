exports.login = function (req, res) {
  var context = {
    title: 'Welcome!',
    prefix: req.app.get('prefix'),
    user: req.user
  };
  res.render('site/login', context);
};

exports.dashboard = function (req, res) {
  req.user.roles = {};
  req.user.displayName = req.user.displayName || req.user.username;
  var context = {
    title: 'Dashboard',
    prefix: req.app.get('prefix'),
    user: req.user
  };
  res.render('site/dashboard', context)
}

exports.admin = function (req, res) {
  req.user.roles = req.user.roles || {};
  var context = {
    title: 'Admin',
    prefix: req.app.get('prefix'),
    user: req.user
  };
  res.render('site/admin', context);
};

module.exports = exports;
