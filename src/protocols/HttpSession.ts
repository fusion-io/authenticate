import {Protocol, UnAuthenticated} from "../core";
import {HttpContext} from "./Contracts";

/**
 * @implements Protocol
 */
export default class HttpSession implements Protocol {

    constructor(private readonly sessionKey = 'credential') {
    }

    public async resolve({session, httpContext: {request}} : { session: any, httpContext: HttpContext }) {

        session = session || request.session;

        if (!session) {
            throw new Error("Session is not started");
        }

        if (!session[this.sessionKey]) {
            throw new UnAuthenticated("UnAuthenticated");
        }

        return session[this.sessionKey];
    }
}
