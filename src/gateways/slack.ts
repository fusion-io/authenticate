import {Gateway, IdentityProvider, IdentityProviderChain} from "../core";
import {ExpressOAuth2, KoaOAuth2} from "../protocols";

declare type Credential = {
    access_token: string,
    user: Object,
    team: Object
}

/**
 * @implements IdentityProvider
 */
class SlackIDP implements IdentityProvider {
    async provide({ access_token, user, team }: Credential) {
        return { access_token, profile: user,  team } ;
    }
}

export const createGateway = (framework: string, options: any, provider: IdentityProvider) => {

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
export const createExpressGateway = (options: any, provider: IdentityProvider) => {
    return createGateway('express', options, provider);
};

/**
 *
 * @param options
 * @param provider
 * @return {Gateway}
 */
export const createKoaGateway = (options: any, provider: IdentityProvider) => {
    return createGateway('koa', options, provider);
};
