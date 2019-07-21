const HttpOAuth2 = require('../Protocols/HttpOAuth2');
const Gateway    = require('../Gateway');
const utils      = require('../utils');
const IDPChain   = require('../IdentityProviderChain');

/**
 * @implements IdentityProvider
 */
class FacebookIdentityProvider {

    constructor(graphAPIVersion = '3.3') {
        this.graphAPIVersion = graphAPIVersion;
    }

    async provide({access_token}) {
        let profile = await utils.callAPI({
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

    const mounter          = ('express' === framework) ? utils.mountExpress() : utils.mountKoa();
    const Protocol         = mounter(HttpOAuth2);
    const protocol         = new Protocol(options);
    const identityProvider = new IDPChain([new FacebookIdentityProvider(options['graphAPIVersion'] || '3.3'), provider]);

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

