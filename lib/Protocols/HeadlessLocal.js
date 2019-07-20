const UnAuthenticated = require('./../UnAuthenticated');

class HeadlessLocal {

    constructor(options = {}) {
        this.options = options;
    }

    resolve(context) {
        const usernameField = this.options['usernameField'] || 'username';
        const passwordField = this.options['passwordField'] || 'password';

        const username = context[usernameField];
        const password = context[passwordField];

        if (!username) {
            throw new UnAuthenticated("Username is required");
        }

        if (!password) {
            throw new UnAuthenticated("Password is required");
        }

        return {username, password};
    }
}

module.exports = HeadlessLocal;
