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
        return {access_token, profile};
    }
}

/**
 *
 * @param options
 * @param {IdentityProvider} provider
 * @return {Gateway}
 */
exports.createExpressGateway = (options, provider) => {
    options = { ...options, host: 'https://graph.facebook.com' };

    const Protocol         = utils.mountExpress()(HttpOAuth2);
    const protocol         = new Protocol(options);
    const identityProvider = new IDPChain([new FacebookIdentityProvider(options['graphAPIVersion'] || '3.3'), provider]);

    return new Gateway(protocol, identityProvider);
};

/**
 *
 * @param options
 * @param provider
 * @return {Gateway}
 */
exports.createKoaGateway = (options, provider) => {
    options = { ...options, host: 'https://graph.facebook.com' };

    const Protocol         = utils.mountKoa()(HttpOAuth2);
    const protocol         = new Protocol(options);
    const identityProvider = new IDPChain([new FacebookIdentityProvider(options['graphAPIVersion'] || '3.3'), provider]);

    return new Gateway(protocol, identityProvider);
};

