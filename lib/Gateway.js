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
        const credential = await this.protocol.resolve(context);

        try {
            const identity = await this.provider.provide(credential);

            if (identity) {
                await this.protocol.responseAuthenticated(identity, context);
            } else {
                await this.protocol.responseUnAuthenticated(new UnAuthenticated("UnAuthenticated"), context);
            }
        } catch (error) {
            await this.protocol.responseUnAuthenticated(error, context);
        }
    }
}

module.exports = Gateway;