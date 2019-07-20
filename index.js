const Authenticator     = require('./lib/Authenticator');
const {
    mountExpress,
    mountKoa,
    mountSocketIO,
    mountYargs
}                       = require('./lib/utils');

const HeadlessLocal     = require('./lib/Protocols/HeadlessLocal');
const HttpOAuth2        = require('./lib/Protocols/HttpOAuth2');
const HttpTokenBearer   = require('./lib/Protocols/HttpTokenBearer');

exports.Gateway         = require('./lib/Gateway');
exports.UnAuthenticated = require('./lib/UnAuthenticated');
exports.Authenticator   = Authenticator;

exports.authenticator   = new Authenticator();

// Mounting decorators
exports.mountExpress    = mountExpress;
exports.mountKoa        = mountKoa;
exports.mountSocketIO   = mountSocketIO;
exports.mountYargs      = mountYargs;

// Basic protocols
exports.HeadlessLocal   = HeadlessLocal;
exports.HttpOAuth2      = HttpOAuth2;
exports.HttpTokenBearer = HttpTokenBearer;

// Derived protocols to transport frameworks
exports.KoaLocal        = mountKoa()(HeadlessLocal);
exports.ExpressLocal    = mountExpress()(HeadlessLocal);
exports.SocketIOLocal   = mountSocketIO()(HeadlessLocal);
exports.YargsLocal      = mountYargs()(HeadlessLocal);

exports.KoaOAuth2       = mountKoa()(HttpOAuth2);
exports.ExpressOAuth2   = mountExpress()(HttpOAuth2);

exports.KoaToken        = mountKoa()(HttpTokenBearer);
exports.ExpressToken    = mountExpress()(HttpTokenBearer);
