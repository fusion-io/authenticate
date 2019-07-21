"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("./../core");
/**
 * @implements Protocol
 */
class HttpTokenBearer {
    /**
     * Resolve the token from the request
     *
     * @param request
     * @return {*}
     */
    async resolve({ httpContext: { request } }) {
        if (request.headers['authorization']) {
            let bearer = request.headers['authorization'];
            if (!bearer.startsWith('bearer ')) {
                throw new core_1.UnAuthenticated("No token provided");
            }
            return { token: bearer.replace('bearer ', '') };
        }
        if (request.query['token']) {
            return { token: request.query['token'] };
        }
        if (request.body && request.body['token']) {
            return { token: request.body['token'] };
        }
        throw new core_1.UnAuthenticated("No token provided");
    }
}
exports.default = HttpTokenBearer;
