/**
 * All available User implementations exported at once.
 */

// A simple in-memory implementation.
module.exports.SimpleUser = require('./SimpleUser');

// Persistent MongoDB-based implementation.
module.exports.MongoUser = require('./MongoUser');
