const jwt             = require('jsonwebtoken');

const {
    UnAuthenticated,
    Gateway,
    SocketIOToken,
    IdentityProviderChain,
    KoaToken,
    ExpressToken
} = require('../index');

/**
 * @implements IdentityProvider
 */
class JWTIdentityProvider {

    constructor(privateKey) {
        this.privateKey = privateKey;
    }

    async provide({token}) {
        try {
            const payload = await jwt.verify(token, this.privateKey);
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
        Protocol = KoaToken;
    } else if ('express' === framework) {
        Protocol = ExpressToken;
    } else {
        Protocol = SocketIOToken;
    }

    return new Gateway(new Protocol(), new IdentityProviderChain([new JWTIdentityProvider(privateKey), provider]))
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
