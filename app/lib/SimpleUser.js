User = function () {
  this._users = {};
}

User.prototype.create = function (args, callback) {
  var id = args.openId
	, user = args.profile;

  user.id = id;
  callback(null, this._users[id]);
};

User.prototype.findById = function (id, callback) {
  if (id in this._users)
    callback(null, this._users[id]);
  else
	callback("User not found.", null);
}

module.exports = User;
