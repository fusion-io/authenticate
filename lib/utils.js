/**
 * Extends protocol for mounting to express endpoint
 */
exports.mountExpress = () => Protocol => {
    return class extends Protocol {
        mount(consumer) {
            return (request, response, next) => consumer({
                context: 'express',
                payload: request.body,
                identityCarrier: request,
                nextSignature: next,
                httpContext: {
                    request,
                    response,
                    next
                }
            });
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
                context: 'koa',
                payload: ctx.request.body,
                identityCarrier: ctx,
                nextSignature: next,
                httpContext: {
                    ctx,
                    next
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
            return (handShakePayload, next) => consumer({
                context: 'socket',
                payload: handShakePayload,
                identityCarrier: handShakePayload,
                nextSignature: next
            });
        }
    }
};

/**
 * Extends protocol for mounting to an Yargs command
 */
exports.mountYargs = () => Protocol => {
    return class extends Protocol {
        mount(consumer) {
            return argv => consumer({
                context: 'console',
                payload: argv,
                identityCarrier: argv,
                nextSignature: () => {}
            });
        }
    }
};
