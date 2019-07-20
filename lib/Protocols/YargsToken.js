const UnAuthenticated = require('./../UnAuthenticated');

/**
 * @implements Protocol
 * @implements Mountable
 */
class YargsToken {

    mount(consumer) {
        return async (argv) => {
            const identity = await consumer(argv);

            return { ...argv, identity };
        };
    }

    resolve({token}) {
        if (!token) {
            throw new UnAuthenticated("No token provided ")
        }
        return undefined;
    }
}

module.exports = YargsToken;
