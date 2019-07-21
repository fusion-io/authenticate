const querystring = require('querystring');
const request     = require('request');
const util        = require('util');
const Aborted     = require('./../Aborted');
const callAPI     = util.promisify(request);

const UnAuthenticated = require('./../UnAuthenticated');

/**
 * Default scope verifier.
 * It will compare the configured scope and the scope
 * from the OAuth2 server if they are equal.
 *
 * @implements StateVerifier
 */
class SillyStateVerifier {

    constructor(state) {
        this.state = state;
    }

    async makeState() {
        return this.state;
    }

    async verify(stateFromOAuth2Server) {
        return stateFromOAuth2Server === this.state.toString();
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

        // If we got the state configuration. We'll add a state verifier
        // for it.
        this.stateVerifier = ('string' === typeof this.options.state) ?

            // If the state is just a plain string.
            // We'll use the silly verifier.
            new SillyStateVerifier(this.options.state) :

            // Otherwise, considered as the user will use their own
            // verifier.
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

        let { host, path, clientId, redirectUri, scope, state } = this.options;

        const qs = {
            response_type: 'code',
            client_id: clientId,
            redirect_uri: redirectUri
        };

        if (scope) {
            qs['scope'] = scope instanceof Array ? scope.join(',') : scope;
        }

        // If the state is configured. We'll ask the verifier make a state for us.
        if (state) {
            qs['state'] = await this.stateVerifier.makeState();
        }

        if (!path) {
            path = '/oauth2/authorize';
        }

        const authorizeUri = `${host}${path}?${querystring.stringify(qs)}`;

        response.redirect(authorizeUri);

        // After we redirect. We'll abort this authentication context.
        // The actual authentication is the resolveAccessToken.
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

        // If the state is configured. We'll ask the verifier to verify if the state
        // is the actual one it sent before.
        if (this.options['state'] && !await this.stateVerifier.verify(request.query['state'])) {
            throw new UnAuthenticated(`OAuth2 state [${request.query['state']}] is invalid`);
        }

        const form = {
            client_id: this.options.clientId,
            client_secret: this.options.clientSecret,
            redirect_uri: this.options.redirectUri,
            code,
            grant_type: 'authorization_code'
        };

        const tokenPath = this.options['tokenPath'] || `${this.options.host}/oauth/access_token`;

        const response = await callAPI({
            url: tokenPath,
            method: 'POST',
            form,
            json: true
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
}

module.exports = HttpOAuth2;
