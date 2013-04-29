exports.profile = function (req, res) {
  req.user.displayName = req.user.displayName || req.user.username;
  var context = {
    title: 'Details of' + req.user.username,
    prefix: req.app.get('prefix'),
    user: req.user
  };
  res.render('profile', context);
};
