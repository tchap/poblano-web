exports.accountNotFound = function (req, res) {
  var context = {
    title: 'Account Not Found',
    prefix: req.app.get('prefix'),
    user: req.user
  };
  res.render('error/accountNotFound', context);
};

exports.accessDenied = error('Access Denied',
  'Your rights are insufficint for accessing this page.')

module.exports = exports;

/**
 * Helpers
 */
function error(status, description) {
  return function (req, res) {
    var context = {
      title: 'Error - ' + status,
      prefix: req.app.get('prefix'),
      user: req.user,
      error: {
        status: status,
        description: description
      }
    };
    res.render('error/general', context);
  };
}
