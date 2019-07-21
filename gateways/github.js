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
class GitHubIDP {
    constructor(ua) {
        this.ua = ua;
    }

    async provide({access_token}) {
        let profile = await callAPI({
            url: 'https://api.github.com/user',
            qs: {access_token},
            headers: {
                'user-agent': this.ua
            }
        });
        return { access_token, profile };
    }
}

exports.createGateway = (framework, options, provider) => {

    if (!['express', 'koa'].includes(framework)) {
        throw new Error(`GitHub gateway does not support framework [${framework}]`);
    }

    options = { ...options, host: 'https://github.com/login' };

    const Protocol         = 'express' === framework ? ExpressOAuth2 : KoaOAuth2;
    const protocol         = new Protocol(options);
    const identityProvider = new IdentityProviderChain([new GitHubIDP(options['ua']), provider]);

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
