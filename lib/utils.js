/**
 * Extends protocol for mounting to express endpoint
 */
exports.mountExpress = () => Protocol => {
    return class extends Protocol {
        mount(consumer) {
            return (request, response, next) => {
                consumer({
                    context: 'http',
                    payload: request.body,
                    identityCarrier: request,
                    httpContext: {
                        request,
                        response
                    }
                }).then(() => next()).catch(error => next(error));
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
                context: 'http',
                payload: ctx.request.body,
                identityCarrier: ctx,
                httpContext: {
                    request: ctx.request,
                    response: ctx.response,
                    next
                }
            }).then(() => next());
        }
    }
};


/**
 * Extends protocol for mounting to a Socket.IO channel
 */
exports.mountSocketIO = () => Protocol => {
    return class extends Protocol {
        mount(consumer) {
            return (handShakePayload, next) => consumer({
                context: 'socket',
                payload: handShakePayload,
                identityCarrier: handShakePayload
            }).then(() => next());
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
                await consumer({
                    context: 'console',
                    payload: argv,
                    identityCarrier: argv
                });

                return argv;
            }
        }
    }
};
