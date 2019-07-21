/**
 * Chaining providers together to provide the final result as an identity.
 *
 * @implements IdentityProvider
 */
import {Credential, IdentityProvider} from "./Contracts";

export default class IdentityProviderChain implements IdentityProvider {

    /**
     *
     * @param {IdentityProvider[]} chains
     */
    constructor(private chains: Array<IdentityProvider> = []) {

    }

    /**
     *
     * @param credential
     * @return {Promise<*>}
     */
    public async provide(credential: Credential) {
        let identityChain: any = credential;

        for (let index = 0; index < this.chains.length; index++) {

            const idp: IdentityProvider = this.chains[index];

            identityChain = await idp.provide(identityChain);

            if (!identityChain) {
                return null;
            }
        }

        return identityChain;
    }
}
