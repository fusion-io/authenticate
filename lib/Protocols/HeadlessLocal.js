const UnAuthenticated = require('./../UnAuthenticated');

class HeadlessLocal {

    constructor(options = {}) {
        this.options = options;
    }

    resolve({payload}) {
        const usernameField = this.options['usernameField'] || 'username';
        const passwordField = this.options['passwordField'] || 'password';

        const username = payload[usernameField];
        const password = payload[passwordField];

        if (!username) {
            throw new UnAuthenticated("Username is required");
        }

        if (!password) {
            throw new UnAuthenticated("Password is required");
        }

        return {username, password};
    }

    responseAuthenticated(identity, {identityCarrier}) {
        identityCarrier.identity = identity;
    }

    responseUnAuthenticated(reason) {
        throw reason;
    }
}

module.exports = HeadlessLocal;
