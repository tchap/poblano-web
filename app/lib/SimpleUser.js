/**
 * A very simple in-memory User implementation.
 */

User = function () {
  this._users = {};
}

User.prototype.findOrCreate = function (args, callback) {
  var keys = ['id', 'profile'];
  for (i in keys) {
    if (!args[keys[i]])
      callback(new Error("Argument missing: " + keys[i]), null);
  }

  var id = args.id
    , user = args.profile;

  user.id = id;
  this._users[id] = user;
  callback(null, user);
};

User.prototype.findById = function (id, callback) {
  if (id in this._users)
    callback(null, this._users[id]);
  else
    callback(new Error("User not found"), null);
}

module.exports = User;
