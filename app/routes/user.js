exports.profile = function (req, res) {
  req.user.displayName = req.user.displayName || req.user.username;
  var context = {
    title: req.user.username + ' - Profile',
    prefix: req.app.get('prefix'),
    user: req.user
  };
  res.render('user/profile', context);
};
