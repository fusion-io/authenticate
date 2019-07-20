const UnAuthenticated = require('./../UnAuthenticated');

/**
 * @implements Protocol
 */
class TokenBearer {

    /**
     * Resolve the token from the request
     *
     * @param request
     * @return {*}
     */
    resolve({httpContext: {request}}) {
        if (request.headers['authorization']) {
            let bearer = request.headers['authorization'];

            if (!bearer.startsWith('bearer ')) {
                throw new UnAuthenticated("No token provided");
            }

            return bearer.replace('bearer ', '');
        }

        if (request.query['token']) {
            return request.query['token'];
        }

        if (request.body['token']) {
            return request.body['token'];
        }

        throw new UnAuthenticated("No token provided");
    }

    responseAuthenticated(identity, {identityCarrier}) {
        identityCarrier.identity = identity;
    }

    responseUnAuthenticated(reason) {
        throw reason;
    }
}

module.exports = TokenBearer;
