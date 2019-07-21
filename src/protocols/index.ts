import {ContextConsumer, Aborted} from "../core";
import HeadlessLocal from "./HeadlessLocal";
import HttpOAuth2 from "./HttpOAuth2";
import HttpSession from "./HttpSession";
import HttpTokenBearer from "./HttpTokenBearer";
import SocketIOToken from "./SocketIOToken";
import util from "util";
import request from "request";
import {mountExpress, mountKoa, mountSocketIO} from "./decorators";

export {
    HeadlessLocal,
    HttpOAuth2,
    HttpSession,
    HttpTokenBearer,
    SocketIOToken
};

export const callAPI        = (options: any) => util.promisify(request)(options, undefined);
export const KoaLocal       = mountKoa(HeadlessLocal);
export const ExpressLocal   = mountExpress(HeadlessLocal);
export const SocketIOLocal  = mountSocketIO(HeadlessLocal);

export const KoaOAuth2      = mountKoa(HttpOAuth2);
export const ExpressOAuth2  = mountExpress(HttpOAuth2);

export const KoaToken       = mountKoa(HttpTokenBearer);
export const ExpressToken   = mountExpress(HttpTokenBearer);

export const KoaSession     = mountKoa(HttpSession);
export const ExpressSession = mountExpress(HttpSession);
