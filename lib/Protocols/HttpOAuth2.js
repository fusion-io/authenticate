const querystring = require('querystring');
const request     = require('request');
const util        = require('util');
const Aborted     = require('./../Aborted');
const callAPI     = util.promisify(request);

const UnAuthenticated = require('./../UnAuthenticated');

/**
 * Default a scope verifier.
 * It will compare the configured scope and the scope
 * from the OAuth2 server if they are equal.
 */
class SillStateVerifier {

    constructor(state) {
        this.state = state;
    }

    async makeState() {
        return this.state;
    }

    async verify(stateFromOAuth2Server) {
        return stateFromOAuth2Server === this.toString();
    }
}

/**
 * This protocol supports the code grant flow.
 *
 * @implements Protocol
 */
class HttpOAuth2 {

    /**
     *
     * @param options
     * @return {HttpOAuth2}
     */
    constructor(options) {
        this.options = options;

        if (!this.options.state) {
            return this;
        }

        this.stateVerifier = ('string' === typeof this.options.state) ?
            new SillStateVerifier(this.options.state) :
            this.options.state
        ;

        return this;
    }

    /**
     * Redirects to the Authorize endpoint to start get the granted code.
     *
     * @param response
     * @return {Promise<void>}
     */
    async redirectToAuthorizeEndpoint({httpContext: {response}}) {

        const { host, clientId, redirectUri, scope, state } = this.options;

        const qs = {
            response_type: 'code',
            client_id: clientId,
            redirect_uri: redirectUri
        };

        if (scope) {
            qs['scope'] = scope instanceof Array ? scope.join(',') : scope;
        }

        if (state) {
            qs['state'] = await this.stateVerifier.makeState();
        }

        const authorizeUri = `${host}/oauth/authorize?${querystring.stringify(qs)}`;

        response.redirect(authorizeUri);

        throw new Aborted();
    }

    /**
     * Handle redirected from the OAuth2 server to exchange granted code to access_token.
     *
     * @param request
     * @return {Promise<*>}
     */
    async resolveAccessToken({httpContext: {request}}) {
        const code = request.query['code'];

        if (this.options['state'] && !await this.stateVerifier.verify(request.query['state'])) {
            throw new UnAuthenticated(`OAuth2 state [${request.query['state']} is invalid`);
        }

        const json = {
            client_id: this.options.clientId,
            client_secret: this.options.clientSecret,
            redirect_uri: this.options.redirectUri,
            code,
            grant_type: 'authorization_code'
        };

        const response = await callAPI({
            url: `${this.options.host}/oauth/access_token`,
            method: 'POST',
            json
        });

        const responseAsJson = response.toJSON();

        if (response.statusCode >= 300) {
            throw new UnAuthenticated(`OAuth2 Server Error. Response from server: ${JSON.stringify(responseAsJson.body)}`);
        }

        return responseAsJson.body;
    }

    /**
     *
     * @param context
     * @return {Promise<*>}
     */
    async resolve(context) {
        return context.httpContext.request.query['code'] ?
            // If there was a code. We'll exchange it to get the
            // access_token.
            await this.resolveAccessToken(context) :

            // If no code in the query string. We'll redirect to the OAuth2 server
            // to get one.
            await this.redirectToAuthorizeEndpoint(context)
        ;
    }

    /**
     *
     * @param identity
     * @param identityCarrier
     */
    responseAuthenticated(identity, {identityCarrier}) {
        identityCarrier.identity = identity;
    }

    /**
     *
     * @param reason
     */
    responseUnAuthenticated(reason) {
        throw reason;
    }
}

module.exports = HttpOAuth2;
