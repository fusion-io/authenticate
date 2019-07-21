const {
    ExpressOAuth2,
    KoaOAuth2,
    Gateway,
    IdentityProviderChain,
} = require('../index');

/**
 * @implements IdentityProvider
 */
class SlackIDP {
    async provide({ access_token, user, team }) {
        return { access_token, profile: user,  team } ;
    }
}

exports.createGateway = (framework, options, provider) => {

    if (!['express', 'koa'].includes(framework)) {
        throw new Error(`Slack gateway does not support framework [${framework}]`);
    }

    options = {
        ...options,
        host: 'https://slack.com',
        path: '/oauth/authorize',
        tokenPath: 'https://slack.com/api/oauth.access'
    };

    const Protocol         = 'express' === framework ? ExpressOAuth2 : KoaOAuth2;
    const protocol         = new Protocol(options);
    const identityProvider = new IdentityProviderChain([new SlackIDP(), provider]);

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
