import {ContextConsumer, Aborted} from "../core";
import HeadlessLocal from "./HeadlessLocal";
import HttpOAuth2 from "./HttpOAuth2";
import HttpSession from "./HttpSession";
import HttpTokenBearer from "./HttpTokenBearer";
import SocketIOToken from "./SocketIOToken";
import util from "util";
import request from "request";

export {
    HeadlessLocal,
    HttpOAuth2,
    HttpSession,
    HttpTokenBearer,
    SocketIOToken
};

export const mountExpress = () => (Protocol: any) => {
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
};
export const mountKoa = () => (Protocol: any) => {
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
};
export const mountSocketIO = () => (Protocol: any) => {
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
};

export const ExpressOAuth2  = mountExpress()(HttpOAuth2);
export const KoaOAuth2      = mountKoa()(HttpOAuth2);
export const callAPI        = util.promisify(request);

