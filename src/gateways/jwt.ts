import jwt from 'jsonwebtoken';
import util from 'util';

import {
    UnAuthenticated,
    Gateway,
    IdentityProviderChain, IdentityProvider
} from "../core";

import {
    SocketIOToken,
    KoaToken,
    ExpressToken
} from "../protocols";

const verifyJWT = util.promisify(jwt.verify);

declare type Credential = {token: string};

/**
 * @implements IdentityProvider
 */
class JWTIdentityProvider implements IdentityProvider {

    constructor(private readonly privateKey: string) {
    }

    async provide({token}: Credential) {
        try {
            const payload = await verifyJWT(token, this.privateKey);
            return {token, payload};
        } catch (e) {
            throw new UnAuthenticated(`JWT Signature invalid. Reason: ${e}`);
        }
    }
}

export const createGateway = (framework: string, privateKey: string, provider: IdentityProvider) => {
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

export const createExpressGateway = (privateKey: string, provider: IdentityProvider) => {
    return createGateway('express', privateKey, provider);
};

export const createKoaGateway = (privateKey: string, provider: IdentityProvider) => {
    return createGateway('koa', privateKey, provider);
};

export const createSocketIOGateway = (privateKey: string, provider: IdentityProvider) => {
    return createGateway('socket.io', privateKey, provider);
};
