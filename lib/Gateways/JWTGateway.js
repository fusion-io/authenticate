const UnAuthenticated = require('../UnAuthenticated');
const Gateway         = require('../Gateway');
const HttpTokenBearer = require('../Protocols/HttpTokenBearer');
const SocketIOTOken   = require('../Protocols/SocketIOToken');
const IDPChain        = require('../IdentityProviderChain');
const {
    mountExpress,
    mountKoa
}                     = require('../utils');
const jwt             = require('jsonwebtoken');
const util            = require('util');
const verifyJWT       = util.promisify(jwt.verify);

/**
 * @implements IdentityProvider
 */
class JWTIdentityProvider {

    constructor(privateKey) {
        this.privateKey = privateKey;
    }

    async provide({token}) {
        try {
            const payload = await verifyJWT(token, this.privateKey);
            return {token, payload};
        } catch (e) {
            throw new UnAuthenticated(`JWT Signature invalid. Reason: ${e}`);
        }
    }
}

exports.createGateway = (framework, privateKey, provider) => {
    if (!['socket.io', 'koa', 'express'].includes(framework)) {
        throw new Error(`JWT gateway does not support framework [${framework}]`);
    }

    let Protocol = null;

    if ('koa' === framework) {
        Protocol = mountKoa()(HttpTokenBearer);
    } else if ('express' === framework) {
        Protocol = mountExpress()(HttpTokenBearer);
    } else {
        Protocol = SocketIOTOken;
    }

    return new Gateway(new Protocol(), new IDPChain([new JWTIdentityProvider(privateKey), provider]))
};

exports.createExpressGateway = (privateKey, provider) => {
    return exports.createGateway('express', privateKey, provider);
};

exports.createKoaGateway = (privateKey, provider) => {
    return exports.createGateway('koa', privateKey, provider);
};

exports.createSocketIOGateway = (privateKey, provider) => {
    return exports.createGateway('socket.io', privateKey, provider);
};
