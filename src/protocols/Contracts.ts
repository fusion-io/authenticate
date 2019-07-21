import {Response} from "express";

export declare type ExpressRequest = {
    session: any
    headers: any
    query: any
    body: any
}

export declare type HttpContext = {
    request: ExpressRequest
    response: Response
}

export declare type SocketContext = {
    handshake: any
    next: Function
}