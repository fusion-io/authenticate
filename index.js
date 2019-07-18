const Authenticator     = require('./lib/Authenticator');
const {
    mountExpress,
    mountKoa,
    mountSocketIO,
    mountYargs
}                       = require('./lib/utils');

exports.Gateway         = require('./lib/Gateway');
exports.UnAuthenticated = require('./lib/UnAuthenticated');
exports.Authenticator   = Authenticator;

exports.authenticator   = new Authenticator();

// Mounting decorators
exports.mountExpress    = mountExpress;
exports.mountKoa        = mountKoa;
exports.mountSocketIO   = mountSocketIO;
exports.mountYargs      = mountYargs;

