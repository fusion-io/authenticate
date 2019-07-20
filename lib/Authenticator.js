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
     * @return {Authenticator}
     */
    gate(gateway, protocol, provider) {
         this.gateways.set(gateway, new Gateway(protocol, provider));
         return this;
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
        const protocol = this.gateways.get(gateway).protocol;
        if ('function' !== typeof protocol.mount) {
            throw new Error(
                `The protocol [${protocol.constructor.name}] of the gateway [${gateway}]` +
                `does not support mounting to a framework.`
            );
        }
        return this.gateways.get(gateway).protocol.mount((context => {
            return this.authenticate(gateway, context);
        }));
    }
}

module.exports = Authenticator;
