/**
 * Get home page.
 */

exports.index = function (req, res) {
  var context = {
	title: 'Welcome to Poblano!',
  };
  if (req.user) {
    context.displayName = req.user.displayName;
  }
  res.render('index', context);
};
