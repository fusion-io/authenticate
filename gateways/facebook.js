const {
    ExpressOAuth2,
    KoaOAuth2,
    Gateway,
    IdentityProviderChain,
    callAPI
} = require('../index');

/**
 * @implements IdentityProvider
 */
class FacebookIdentityProvider {

    constructor(graphAPIVersion = '3.3') {
        this.graphAPIVersion = graphAPIVersion;
    }

    async provide({access_token}) {
        let profile = await callAPI({
            url: `https://graph.facebook.com/v${this.graphAPIVersion}/me`,
            qs: {access_token},
        });
        return { access_token, profile };
    }
}

exports.createGateway = (framework, options, provider) => {

    if (!['express', 'koa'].includes(framework)) {
        throw new Error(`Facebook gateway does not support framework [${framework}]`);
    }

    options = { ...options, host: 'https://graph.facebook.com' };

    const Protocol         = 'express' === framework ? ExpressOAuth2 : KoaOAuth2;
    const protocol         = new Protocol(options);
    const identityProvider = new IdentityProviderChain([new FacebookIdentityProvider(options['graphAPIVersion'] || '3.3'), provider]);

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
