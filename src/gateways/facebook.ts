import {Gateway, IdentityProvider, IdentityProviderChain} from "../core";
import {ExpressOAuth2, KoaOAuth2, callAPI} from "../protocols";

declare type Credential = {
    access_token: string
};


/**
 * @implements IdentityProvider
 */
class FacebookIdentityProvider implements IdentityProvider {

    constructor(private readonly graphAPIVersion = '3.3') {
    }

    public async provide({access_token}: Credential) {
        let profile = await callAPI({
            url: `https://graph.facebook.com/v${this.graphAPIVersion}/me`,
            qs: {access_token},
        });
        return { access_token, profile };
    }
}

exports.createGateway = (framework: string, options: any, provider: IdentityProvider) => {

    if (!['express', 'koa'].includes(framework)) {
        throw new Error(`Facebook gateway does not support framework [${framework}]`);
    }

    options = { ...options, host: 'https://graph.facebook.com' };

    const protocol         = 'express' === framework ? new ExpressOAuth2(options) : new KoaOAuth2(options);
    const identityProvider = new IdentityProviderChain([
        new FacebookIdentityProvider(options['graphAPIVersion'] || '3.3'),
        provider
    ]);

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
