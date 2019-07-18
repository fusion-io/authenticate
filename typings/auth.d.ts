export interface Protocol {
    resolve(context: Object): Promise<Credential>;
    responseUnAuthenticated(reason: any, context: Object);
    responseAuthenticated(identity: Identity, context: Object);
}

export interface IdentityProvider {
    provide(credential: Credential): Promise<Identity>;
}

export interface Credential {

}

export interface Identity {

}

export class UnAuthenticated extends Error {

}
