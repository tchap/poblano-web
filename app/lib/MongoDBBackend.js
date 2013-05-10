/**
 * A User implementation backed by MongoDB.
 */
var format = require('util').format;
  , Db = require('mongodb').Db;

var Backend = function (config) {
  this._db = new Db('poblanoweb',
                    new Server(config.MONGODB_HOST, config.MONGODB_PORT, {}),
                    {w:1});
  this.users = new Users(this._db);
}

var Users = function (db) {
  this._db = db;
};

Users.prototype.createFromServiceId = function (service, args, cb) {
  var self = this
    , profileIdKey = service + 'Id'
    , id = args[profileIdKey];

  if (id)
    self._users(function (err, users) {
      if (err)
        cb(err, null);
      else
        var user = users.findOne({'accounts.' + service + '.id'});
        if (user) {
          cb(null, user);
          return;
        }
        users.insert({'accounts': {service: {'id': id}}}, function(err, docs) {
          if (err)
            cb(err, null);
          else
            cb(null, docs);
        });
    });
  else
    cb(new Error(profileKey + ' key is missing in the arguments.'), null);
}

Users.prototype.findById = function (id, cb) {
  this._users(function(err, users) {
    if (err)
      cb(err, null);
    else
      cb(null, users.findOne({'_id': id}));
  });
}

Users.prototype.findByServiceId = function (service, args, cb) {
  var self = this,
    , idKey = service + 'Id',
    , id = args[idKey];

  if (id)
    self._users(function(err, users) {
      if (err)
        cb(err, null);
      else
        cb(null, users.findOne({'accounts.' + service + '.id': id}));
    });
  else
    callback(new Error(idKey + ' key missing in the arguments.'), null);
}

Users.prototype.findAll = function (cb) {
  this._users(function(err, users) {
    cb(err, users);
  });
}

Users.prototype._users = function(cb) {
  this._db.open(function(err, client) {
    if (err)
      cb(err, null);
    else
      client.collection('users', function(err, users) {
        if (err)
          cb(err, null);
        else
          cb(null, users);
      });
  });
}

module.exports = Backend;
