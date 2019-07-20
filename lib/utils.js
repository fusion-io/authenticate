const Aborted = require('./Aborted');

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
                if (!error instanceof Aborted) {
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

/**
 * Extends protocol for mounting to an Yargs command
 */
exports.mountYargs = () => Protocol => {
    return class extends Protocol {
        mount(consumer) {
            return async argv => {
                const identity = await consumer({
                    context: 'console',
                    ...argv
                });

                return {
                    ...argv,
                    identity
                };
            }
        }
    }
};
