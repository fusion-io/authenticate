import {Gateway, IdentityProvider, IdentityProviderChain} from "../core";
import {ExpressOAuth2, KoaOAuth2, callAPI} from "../protocols";

declare type Credential = {
    access_token: string
};

/**
 * @implements IdentityProvider
 */
class GitHubIDP implements IdentityProvider {
    constructor(private readonly ua: string) {
    }

    async provide({access_token}: Credential) {
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

export const createGateway = (framework: string, options: any, provider: IdentityProvider) => {

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
export const createExpressGateway = (options: any, provider: IdentityProvider) => {
    return createGateway('express', options, provider);
};

/**
 *
 * @param options
 * @param provider
 * @return {Gateway}
 */
export const reateKoaGateway = (options: any, provider: IdentityProvider) => {
    return createGateway('koa', options, provider);
};
