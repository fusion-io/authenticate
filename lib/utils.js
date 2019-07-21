const request    = require("request");
const util       = require("util");
const Aborted    = require('./Aborted');

const callAPI    = util.promisify(request);

/**
 * A helper to call API for some 3rd party OAuth service providers.
 *
 * @param options
 * @return {Promise<*>}
 */
exports.callAPI  = async options => {
    let response = await callAPI(options);

    if (response.statusCode >= 300) {
        throw new Error(`Http Error with status code [${response.statusCode}]: ${response.body}`);
    }

    return JSON.parse(response.body);
};

/**
 * Extends protocol for mounting to express endpoint
 */
exports.mountExpress = () => Protocol => {
    return class extends Protocol {
        mount(consumer) {
            return (request, response, next) => {
                consumer({ ...request.body, context: 'http', httpContext: { request, response } })
                    .then(identity => {
                        request.identity = identity;
                        next();
                    })
                    .catch(error => {
                        // If authentication aborted. We'll just skip this route.
                        if (error instanceof Aborted) {
                            return null;
                        }

                        next(error);
                    })
                ;
            };
        }
    }
};

/**
 * Extends protocol for mounting to koa endpoint
 */
exports.mountKoa = () => Protocol => {
    return class extends Protocol {
        mount(consumer) {
            return (ctx, next) => consumer({
                ...ctx.request.body,
                context: 'http',
                httpContext: ctx
            }).then(identity => {
                ctx.identity = identity;
                return next();
            }).catch(error => {
                // If authentication aborted. We'll just skip this route.
                if (!(error instanceof Aborted)) {
                    throw error;
                }
            });
        }
    }
};


/**
 * Extends protocol for mounting to a Socket.IO channel
 */
exports.mountSocketIO = () => Protocol => {
    return class extends Protocol {
        mount(consumer) {
            return (socket, next) => consumer({
                context: 'socket',
                ...socket.handshake.query,
                socketContext: socket
            }).then(identity => {
                socket.identity = identity;
                next();
            }).catch((error) => next(error));
        }
    }
};
