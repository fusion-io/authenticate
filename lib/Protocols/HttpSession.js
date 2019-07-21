"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
/**
 * @implements Protocol
 */
class HttpSession {
    constructor(sessionKey = 'credential') {
        this.sessionKey = sessionKey;
    }
    async resolve({ session, httpContext: { request } }) {
        session = session || request.session;
        if (!session) {
            throw new Error("Session is not started");
        }
        if (!session[this.sessionKey]) {
            throw new core_1.UnAuthenticated("UnAuthenticated");
        }
        return session[this.sessionKey];
    }
}
exports.default = HttpSession;
