/**
 * A Backend implementation backed by MongoDB.
 */
var util = require('util')
  , Db = require('mongodb').Db
  , Server = require('mongodb').Server
  , ObjectID = require('mongodb').ObjectID;

var Backend = function(config) {
  var self = this;

  this.db = new Db('poblanoweb',
                   new Server(config.MONGODB_HOST, config.MONGODB_PORT,
                              {auto_reconnect: true}),
                   {w:1});
  this.db.open(function(err, client) {
    self.users = new Users(client);
    console.log('Connected to MongoDB successfully.');
  });
}

/**
 * Classes
 */

// Base collection class
function Collection(name, db) {
  this._collectionName = name;
  this._db = db;
};

Collection.prototype.create = function(doc, cb) {
  var self = this;

  self._collection(function(err, coll) {
    if (err) cb(err, null);
    else coll.insert(doc, function(err, docs) {
      if (err) cb(err, null);
      else cb(null, docs[0]);
    });
  });
};

Collection.prototype.find = function(selector, cb) {
  var self = this;

  self._collection(function (err, coll) {
    if (err) cb(err, null);
    else coll.find(selector).toArray(cb);
  });
}

Collection.prototype.findOne = function(selector, cb) {
  var self = this;

  self._collection(function (err, coll) {
    if (err) cb(err, null);
    else coll.findOne(selector, cb);
  });
}

Collection.prototype.findOrCreateOne = function(selector, doc, cb) {
  var self = this;

  self._collection(function (err, coll) {
    if (err) cb(err, null);
    else {
      coll.findOne(selector, function(err, doc) {
        if (err) {
          cb(err, null);
          return;
        }
        if (doc) {
          cb(null, doc);
          return;
        }
        coll.insert(doc, function(err, docs) {
          if (err) cb(err, null);
          else cb(null, docs[0]);
        });
      });
    }
  });
}

Collection.prototype._collection = function(cb) {
  this._db.collection(this._collectionName, cb);
}

// Users Collection
function Users(db) {
  this._db = db;
  this._collectionName = 'users';
}

util.inherits(Users, Collection);

Users.prototype.findOneById = function (id, cb) {
  this.findOne({'_id': new ObjectID(id)}, cb);
}

Users.prototype.findOneByServiceId = function (service, id, cb) {
  var selector = {};

  selector['accounts.' + service + '.id'] = id;
  this.findOne(selector, cb);
}

/**
 * Exports
 */
module.exports = Backend;
