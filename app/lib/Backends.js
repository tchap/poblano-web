/**
 * All available User implementations exported at once.
 */

// A simple in-memory implementation.
module.exports.SimpleBackend = require('./SimpleBackend');

// Persistent MongoDB-based implementation.
module.exports.MongoDBBackend = require('./MongoDBBackend');
