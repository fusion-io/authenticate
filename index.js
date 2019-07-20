const Authenticator     = require('./lib/Authenticator');
const {
    mountExpress,
    mountKoa,
    mountSocketIO
}                       = require('./lib/utils');

const HeadlessLocal     = require('./lib/Protocols/HeadlessLocal');
const HttpOAuth2        = require('./lib/Protocols/HttpOAuth2');
const HttpTokenBearer   = require('./lib/Protocols/HttpTokenBearer');
const HttpSession       = require('./lib/Protocols/HttpSession');

exports.Gateway         = require('./lib/Gateway');
exports.UnAuthenticated = require('./lib/UnAuthenticated');
exports.Authenticator   = Authenticator;

exports.authenticator   = new Authenticator();

// Mounting decorators
exports.mountExpress    = mountExpress;
exports.mountKoa        = mountKoa;
exports.mountSocketIO   = mountSocketIO;

// Basic protocols
exports.HeadlessLocal   = HeadlessLocal;
exports.HttpOAuth2      = HttpOAuth2;
exports.HttpTokenBearer = HttpTokenBearer;
exports.HttpSession     = HttpSession;

// Derived protocols to transport frameworks

// Local
exports.KoaLocal        = mountKoa()(HeadlessLocal);
exports.ExpressLocal    = mountExpress()(HeadlessLocal);
exports.SocketIOLocal   = mountSocketIO()(HeadlessLocal);

// OAuth2
exports.KoaOAuth2       = mountKoa()(HttpOAuth2);
exports.ExpressOAuth2   = mountExpress()(HttpOAuth2);

// Token
exports.KoaToken        = mountKoa()(HttpTokenBearer);
exports.ExpressToken    = mountExpress()(HttpTokenBearer);
exports.SocketIOToken   = require('./lib/Protocols/SocketIOToken');

// Session
exports.KoaSession      = mountKoa()(HttpSession);
exports.ExpressSession  = mountExpress()(HttpSession);
