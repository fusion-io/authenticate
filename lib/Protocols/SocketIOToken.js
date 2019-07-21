const UnAuthenticated = require('./../UnAuthenticated');

/**
 * @implements Protocol
 * @implements Mountable
 */
class SocketIOToken {

    mount(consumer) {
        return (socket, next) => {
            consumer({socket}).then(identity => {
                socket.identity = identity;
                next();
            }).catch(error => {
                if (error instanceof UnAuthenticated) {
                    next(error);
                } else {
                    throw error;
                }
            })
        };
    }

    resolve({socket: {handshake}}) {
        if (!handshake.query.token) {

            throw new UnAuthenticated("No token provided");
        }

        return { token: handshake.query.token };
    }
}

module.exports = SocketIOToken;
