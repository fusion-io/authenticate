const Authenticator     = require('./lib/Authenticator');

exports.Gateway         = require('./lib/Gateway');
exports.UnAuthenticated = require('./lib/UnAuthenticated');
exports.Authenticator   = Authenticator;

exports.authenticator   = new Authenticator();
