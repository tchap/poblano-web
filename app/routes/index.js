/**
 * Get home page (authenticated).
 */

exports.index = function (req, res) {
  var context = {
    title: 'Welcome to Poblano!',
    username: req.user.displayName,
  };
  res.render('index', context);
};
