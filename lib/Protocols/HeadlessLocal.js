class HeadlessLocal {

    constructor(options) {
        this.options = options;
    }

    resolve(payload) {
        const usernameField = this.options['usernameField'] || 'username';
        const passwordField = this.options['passwordField'] || 'password';

        const username = payload[usernameField];
        const password = payload[passwordField];

        if (!username) {
            // TODO
        }

        if (!password) {
            // TODO
        }

        return {username, password};
    }

    responseAuthenticated(identity, {identityCarrier, nextSignature}) {
        identityCarrier.identity = identity;
        return nextSignature();
    }

    responseUnAuthenticated(reason) {
        throw reason;
    }
}

module.exports = HeadlessLocal;
