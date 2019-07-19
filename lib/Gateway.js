const UnAuthenticated  = require('./UnAuthenticated');
const Aborted          = require('./Aborted');

/**
 * A gate to determine of in the given context, the given Credential is
 * authenticated or not.
 */
class Gateway {

    /**
     *
     * @param {Protocol} protocol
     * @param {IdentityProvider} provider
     */
    constructor(protocol, provider) {
        this.protocol = protocol;
        this.provider = provider;
    }

    /**
     * Perform the authentication process with a given context.
     *
     * @return {Promise<void>}
     */
    async authenticate(context) {
        try {
            const credential = await this.protocol.resolve(context);
            const identity   = await this.provider.provide(credential);

            identity ?
                await this.protocol.responseAuthenticated(identity, context) :
                await this.protocol.responseUnAuthenticated(new UnAuthenticated("UnAuthenticated"), context)
            ;
        } catch (error) {
            if (error instanceof UnAuthenticated) {
                await this.protocol.responseUnAuthenticated(error, context);
            } else if (error instanceof Aborted) {
                return error;
            } else {
                throw error;
            }
        }
    }
}

module.exports = Gateway;
