const { callAPI, Gateway } = require('../index');

const crypto = require('crypto');
const OAuth = require('oauth-1.0a');


const twitterOAuthAPI = 'https://api.twitter.com/oauth';

/**
 * Since twitter have a pretty unique way of doing authentication.
 * We'll make one special protocol for it.
 *
 * @implements Protocol
 */
class Twitter3LeggedAuthorizationProtocol {

    constructor({callback, consumerKey, consumerSecret, signer}) {
        this.callback       = callback;
        this.consumerKey    = consumerKey;
        this.consumerSecret = consumerSecret;
        this.signer         = signer;
    }

    async requestToken() {
        try {

            const token = {
                key     : this.consumerKey,
                secret  : this.consumerSecret
            };

            const request = {
                url: `${twitterOAuthAPI}/request_token`,
                method: 'POST',
                data: {
                    oauth_consumer_key: this.consumerKey,
                    oauth_callback: this.callback
                }
            };

            const response = await callAPI({
                method: request.method,
                url: request.url,
                headers: this.signer.toHeader(this.signer.authorize(request, token)),
                form: request.data
            });

            // TODO
        } catch (e) {
            // TODO
        }
    }

    async resolve(context) {
        await this.requestToken();
    }

    mount(consumer) {
        return (request, response, next) => {
            consumer().catch(error => next(error));
        }
    }
}

exports.createExpressGateway = ({callback, consumerKey, consumerSecret, oauthToken}, provider) => {

    const oauth1a = OAuth({
        consumer: { key: consumerKey, secret: consumerSecret },
        signature_method: 'HMAC-SHA1',
        hash_function(base_string, key) {
            return crypto
                .createHmac('sha1', key)
                .update(base_string)
                .digest('base64')
        },
    });

    return new Gateway(new Twitter3LeggedAuthorizationProtocol({signer: oauth1a, callback, consumerSecret, consumerKey}), provider);
};