import {IdentityProvider, MountableProtocol, Protocol} from "./Contracts";
import UnAuthenticated from "./UnAuthenticated";
/**
 * A gate to determine of in the given context, the given Credential is
 * authenticated or not.
 */
export default class Gateway {


    constructor(public protocol: MountableProtocol, public provider: IdentityProvider) {

    }

    /**
     * Perform the authentication process with a given context.
     *
     */
    public async authenticate(context: Object) {
        const credential = await (this.protocol as Protocol).resolve(context);
        const identity   = await this.provider.provide(credential);

        if (!identity) {
            throw new UnAuthenticated("Identity not found");
        }

        return identity;
    }
}
