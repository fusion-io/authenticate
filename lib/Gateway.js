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
     * @return {Promise<*>}
     */
    async authenticate(context) {
        const credential = await this.protocol.resolve(context);
        const identity   = await this.provider.provide(credential);

        if (!identity) {
            throw new UnAuthenticated("Identity not found");
        }

        return identity;
    }
}

module.exports = Gateway;
