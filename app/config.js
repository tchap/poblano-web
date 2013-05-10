/**
 * Global Poblano Configuration
 */

var ENV_PREFIX = 'POBLANO_'

var config = {};

/**
 * Frontend
 */

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

/**
 * Backend
 */

// User Strategy
update(config, 'MONGODB_ENABLED', false);
if (config.MONGODB_ENABLED) {
	required(update(config, 'MONGODB_HOST'));
	required(update(config, 'MONGODB_PORT'));
}

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
		|| process.env[ENV_PREFIX + key]
		|| defaultValue;

	return obj[key]
}

function required(value) {
	if (value === undefined)
		throw new Error('Required argument not supplied.');
}
