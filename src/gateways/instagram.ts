import {Gateway, IdentityProvider, IdentityProviderChain} from "../core";
import {ExpressOAuth2, KoaOAuth2} from "../protocols";

declare type Credential = {
    access_token: string,
    user: string
}

/**
 * @implements IdentityProvider
 */
class InstagramIDP implements IdentityProvider {
    async provide({access_token, user}: Credential) {

        return { access_token, profile: user };
    }
}

exports.createGateway = (framework: string, options: any, provider: IdentityProvider) => {

    if (!['express', 'koa'].includes(framework)) {
        throw new Error(`Instagram gateway does not support framework [${framework}]`);
    }

    options = { ...options, host: 'https://api.instagram.com', path: '/oauth/authorize' };

    const Protocol         = 'express' === framework ? ExpressOAuth2 : KoaOAuth2;
    const protocol         = new Protocol(options);
    const identityProvider = new IdentityProviderChain([new InstagramIDP(), provider]);

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
