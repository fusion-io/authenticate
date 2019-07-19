/**
 * An error that will be thrown if the authentication process
 * was failed.
 */
class UnAuthenticated extends Error {
    constructor(message) {
        super();
        this.message = message;
    }

    get code() {
        return 401;
    }
}

module.exports = UnAuthenticated;
