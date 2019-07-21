const {
    ExpressOAuth2,
    KoaOAuth2,
    Gateway,
    IdentityProviderChain,
    UnAuthenticated
} = require('../index');

const jwt = require('jsonwebtoken');

/**
 * @implements IdentityProvider
 */
class GoogleIDP {
    constructor(clientSecret) {
        this.clientSecret = clientSecret;
    }

    async provide({access_token, id_token}) {

        try {
            const profile = jwt.decode(id_token, this.clientSecret);

            return { access_token, id_token, profile };
        } catch (error) {
            throw new UnAuthenticated(`Invalid id token. Reason: ${error.message}`);
        }
    }
}

exports.createGateway = (framework, options, provider) => {

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
exports.createExpressGateway = (options, provider) => {
    return exports.createGateway('express', options, provider);
};

/**
 *
 * @param options
 * @param provider
 * @return {Gateway}
 */
exports.createKoaGateway = (options, provider) => {
    return exports.createGateway('koa', options, provider);
};
