exports.initialise = function (req, res) {
  req.user.displayName = req.user.displayName || req.user.username;
  var context = {
    title: 'Initialise',
    prefix: req.app.get('prefix'),
    user: req.user
  };
  res.render('initialise', context);
};
