/**
 * All available User implementations exported at once.
 */
var Config = require('../config')
  , MongoDBBackend = require('./MongoDBBackend')
  , SimpleBackend = require('./MongoDBBackend');

if (Config.MONGODB_ENABLED) exports.Backend = MongoDBBackend;
else exports.Backend = SimpleBackend;

module.exports = exports;
