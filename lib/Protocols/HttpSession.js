const UnAuthenticated = require('./../UnAuthenticated');

/**
 * @implements Protocol
 */
class HttpSession {

    constructor(sessionKey = 'identity') {
        this.sessionKey = sessionKey;
    }

    resolve({session, httpContext: {request}}) {

        session = session || request.session;

        if (!session) {
            throw new Error("Session is not started");
        }

        if (!session[this.sessionKey]) {
            throw new UnAuthenticated("UnAuthenticated");
        }

        return session[this.sessionKey];
    }
}

module.exports = HttpSession;
