User = function () {
  this._users = {};
}

User.prototype.create = function (args, callback) {
  var id = args.openId
    , user = args.profile;
  user.id = id;
  this._users[id] = user;
  callback(null, user);
};

User.prototype.findById = function (id, callback) {
  if (id in this._users)
    callback(null, this._users[id]);
  else
    callback(new Exception("User not found."), null);
}

module.exports = User;
