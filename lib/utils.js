/**
 * Extends protocol for mounting to express endpoint
 */
exports.mountExpress = () => Protocol => {
    return class extends Protocol {
        mount(consumer) {
            return (request, response, next) => consumer({request, response, next});
        }
    }
};

/**
 * Extends protocol for mounting to koa endpoint
 */
exports.mountKoa = () => Protocol => {
    return class extends Protocol {
        mount(consumer) {
            return (ctx, next) => consumer({ctx, next});
        }
    }
};


/**
 * Extends protocol for mounting to a Socket.IO channel
 */
exports.mountSocketIO = () => Protocol => {
    return class extends Protocol {
        mount(consumer) {
            return (socket, next) => consumer({socket, next});
        }
    }
};

/**
 * Extends protocol for mounting to an Yargs command
 */
exports.mountYargs = () => Protocol => {
    return class extends Protocol {
        mount(consumer) {
            return argv => consumer(argv);
        }
    }
};
