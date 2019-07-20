/**
 * A callback function that consumes the context.
 */
interface ContextConsumer { (context): void }

/**
 * In the most cases, the protocol by itself can resolve
 * the authentication context. If so, it is a Mountable protocol.
 * Which can mount into the transport layer and populate the context.
 *
 */
export interface Mountable {
    mount(consumer: ContextConsumer): any;
}

/**
 * A Service that can load the Credential from a give environment.
 * That environment so-called as the Authentication Context.
 */
export interface Protocol {

    /**
     * Load (resolve) the credential
     *
     * @param context
     */
    resolve(context: Object): Promise<Credential>;

    /**
     * Interacts with the context when the authentication was failed.
     *
     * @param reason
     * @param context
     */
    responseUnAuthenticated(reason: any, context: Object);

    /**
     * Interacts with the context when the authentication was success.
     * And we already got the Identity.
     *
     * @param identity
     * @param context
     */
    responseAuthenticated(identity: Identity, context: Object);
}

/**
 * The service that will find an Identity satisfied the given Credential.
 */
export interface IdentityProvider {

    /**
     *
     * Providing the identity against the given credential.
     *
     * @param credential
     */
    provide(credential: Credential): Promise<Identity>;
}

/**
 * A piece of information that can be used for authenticating
 */
export interface Credential {

}

/**
 * A piece of information that can be used for identifying
 * a resource.
 */
export interface Identity {

}

/**
 * A service for verifying the an oauth2 state
 */
export interface StateVerifier {

    makeState(): Promise<string>;

    verify(stateFromOAuth2Server): Promise<boolean>
}
