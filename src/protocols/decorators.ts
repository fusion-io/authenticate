import {ContextConsumer} from "../core";
import Aborted from "../core/Aborted";

export function mountExpress<T extends {new(...args:any[]):{}}> (Protocol:T) {
    return class extends Protocol {
        mount(consumer: ContextConsumer) {
            return (request: any, response: any, next: Function) => {
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
}
export function mountKoa<T extends {new (...args:any[]): {}}>(Protocol: T) {
    return class extends Protocol {
        mount(consumer: ContextConsumer) {
            return (ctx: any, next: Function) => consumer({
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
}

export function mountSocketIO<T extends {new (...args: any[]): {}}>(Protocol: T) {
    return class extends Protocol {
        mount(consumer: ContextConsumer) {
            return (socket: any, next: Function) => consumer({
                context: 'socket',
                ...socket.handshake.query,
                socketContext: socket
            }).then(identity => {
                socket.identity = identity;
                next();
            }).catch((error) => {
                next(error);
            });
        }
    }
}
