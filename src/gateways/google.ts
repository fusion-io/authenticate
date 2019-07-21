import {Gateway, IdentityProvider, IdentityProviderChain, UnAuthenticated} from "../core";
import {ExpressOAuth2, KoaOAuth2} from "../protocols";
import jwt, {DecodeOptions} from "jsonwebtoken";

declare type Credential = {
    access_token: string,
    id_token: string
}

/**
 * @implements IdentityProvider
 */
class GoogleIDP implements IdentityProvider {
    constructor(private readonly clientSecret: string) {
    }

    async provide({access_token, id_token}: Credential) {

        try {
            const profile = jwt.decode(id_token, (this.clientSecret as DecodeOptions));

            return { access_token, id_token, profile };
        } catch (error) {
            throw new UnAuthenticated(`Invalid id token. Reason: ${error.message}`);
        }
    }
}

exports.createGateway = (framework: string, options: any, provider: IdentityProvider) => {

    if (!['express', 'koa'].includes(framework)) {
        throw new Error(`Google gateway does not support framework [${framework}]`);
    }

    options = { ...options, tokenPath: 'https://oauth2.googleapis.com/token', host: 'https://accounts.google.com', path: '/o/oauth2/v2/auth' };

    const Protocol         = 'express' === framework ? ExpressOAuth2 : KoaOAuth2;
    const protocol         = new Protocol(options);
    const identityProvider = new IdentityProviderChain([new GoogleIDP(options['ua']), provider]);

    return new Gateway(protocol, identityProvider);
};

/**
 *
 * @param options
 * @param {IdentityProvider} provider
 * @return {Gateway}
 */
exports.createExpressGateway = (options: any, provider: IdentityProvider) => {
    return exports.createGateway('express', options, provider);
};

/**
 *
 * @param options
 * @param provider
 * @return {Gateway}
 */
exports.createKoaGateway = (options: any, provider: IdentityProvider) => {
    return exports.createGateway('koa', options, provider);
};
