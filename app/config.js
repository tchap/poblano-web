/**
 * Global Poblano Configuration
 */

var ENVIRON_PREFIX = 'POBLANO_'

var config = {};

// Listen
update(config, 'HTTP_HOST', 'http://localhost');
update(config, 'HTTP_PORT', 3000);
update(config, 'HTTP_PATH_PREFIX', '');
update(config, 'HTTP_FORWARDED_HOST', config.HTTP_HOST);
update(config, 'HTTP_PROXY_ENABLED', false);

// Sessions
required(update(config, 'SESSION_SECRET'));

// GitHub Passport Strategy
required(update(config, 'GITHUB_CLIENT_ID'));
required(update(config, 'GITHUB_CLIENT_SECRET'));

// User Strategy
config.strategy = {};
config.strategy['User'] = require('./lib/User').SimpleUser;

/**
 * Export
 */
module.exports = config;

/**
 * Helpers
 */
function update() {
	if (arguments.length < 2) {
		throw new Error('Not enough arguments.');
	}

	var obj		 = arguments[0]
	  , key          = arguments[1]
	  , defaultValue = arguments[2]

	obj[key] = obj[key]
		|| process.env[ENVIRON_PREFIX + key]
		|| defaultValue;

	return obj[key]
}

function required(value) {
	if (value === undefined)
		throw new Error('Required argument not supplied.');
}
