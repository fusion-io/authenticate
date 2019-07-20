const Gateway = require('./Gateway');

/**
 * An authenticator service. It its simplest form, it managing
 * gateways.
 */
class Authenticator {
    constructor() {
        this.gateways = new Map();
    }

    /**
     *
     * @param gateway
     * @param protocol
     * @param provider
     */
    gate(gateway, protocol, provider) {
         this.gateways.set(gateway, new Gateway(protocol, provider));
    }

    /**
     * Authenticate a context by a given gateway.
     *
     * @param gateway
     * @param context
     * @return {Promise<void>}
     */
    authenticate(gateway, context) {
        return this.gateways.get(gateway).authenticate(context);
    }

    /**
     * Returning a connection which can be used to mount to
     * the transport layer.
     *
     * Normally, we need to authenticate over Http, then guard() will
     * return a middleware.
     *
     * If we authenticate over Socket, then guard() will return the
     * socket connection middleware.
     *
     * @param gateway
     * @return {mount}
     */
    guard(gateway) {
        return this.gateways.get(gateway).protocol.mount((context => {
            return this.authenticate(gateway, context);
        }));
    }
}

module.exports = Authenticator;
