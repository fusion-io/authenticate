class UnAuthenticated extends Error {
    constructor(message) {
        super();
        this.message = message;
    }
}

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

/**
 * An authenticator service.
 */
class Authenticator {
    constructor() {
        this.gateways = new Map();
    }

    authenticate(gateway, context) {
        return this.gateways.get(gateway).authenticate(context);
    }

    mount(gateway, mounter) {
        return (...parameters) => this.authenticate(gateway, mounter(...parameters));
    }
}


exports.Gateway = Gateway;
exports.Authenticator = Authenticator;
