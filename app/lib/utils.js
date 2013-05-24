var Config = require('../config');

/**
 * Get the full URL for the path.
 */
exports.getFullUrl = function(path) {
  return Config.HTTP_FORWARDED_HOST + Config.HTTP_PATH_PREFIX + path
}

module.exports = exports;
