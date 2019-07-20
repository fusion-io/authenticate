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
                next(error);
            })
        };
    }

    resolve({socket: {handshake}}) {

        if (!handshake.query.token) {
            throw new UnAuthenticated("No token provided");
        }

        return handshake.query.token;
    }
}

module.exports = SocketIOToken;
