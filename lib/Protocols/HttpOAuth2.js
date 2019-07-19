const querystring = require('querystring');
const request     = require('request');
const util        = require('util');
const Aborted     = require('./../Aborted');
const callAPI     = util.promisify(request);

/**
 * @implements Protocol
 */
class HttpOAuth2 {

    constructor() {

    }

    makeAuthorizeURL() {
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
            qs['state'] = state;
        }

        return `${host}/oauth/authorize?${querystring.stringify(qs)}`;
    }

    setOptions(options) {
        this.options = options;

        return this;
    }

    async resolve({httpContext: {request, response}}) {
        if (request.query['code']) {
            // we'll have to verify the code here.
            const code = request.query['code'];

            const json = {
                client_id: this.options.clientId,
                client_secret: this.options.clientSecret,
                redirect_uri: this.options.redirectUri,
                code,
                grant_type: 'authorization_code'
            };
            return await callAPI({
                url: `${this.options.host}/oauth/access_token`,
                method: 'POST',
                json
            }).then(resp => {
                return resp.toJSON().body;
            });


        } else {
            response.redirect(this.makeAuthorizeURL());

            throw new Aborted();
        }

    }

    responseAuthenticated(identity, {identityCarrier}) {
        identityCarrier.identity = identity;
    }

    responseUnAuthenticated(reason) {
        throw reason;
    }
}

module.exports = HttpOAuth2;
