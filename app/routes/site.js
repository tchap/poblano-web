exports.login = function (req, res) {
  var context = {
    title: 'Welcome!',
    prefix: req.app.get('prefix')
  };
  res.render('login', context);
};

exports.index = function (req, res) {
  req.user.displayName = req.user.displayName || req.user.username;
  var context = {
    title: 'Dashboard',
    prefix: req.app.get('prefix'),
    user: req.user
  };
  res.render('index', context)
}

exports.admin = exports.index;
