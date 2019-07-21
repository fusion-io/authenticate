/**
 * Chaining providers together to provide the final result as an identity.
 *
 * @implements IdentityProvider
 */
class IdentityProviderChain {

    /**
     *
     * @param {IdentityProvider[]} chains
     */
    constructor(chains = []) {
        this.chains = chains;
    }

    /**
     *
     * @param credential
     * @return {Promise<*>}
     */
    async provide(credential) {
        let identityChain = credential;

        for (let index = 0; index < this.chains.length; index++) {
            identityChain = await this.chains[index].provide(identityChain);

            if (!identityChain) {
                return null;
            }
        }

        return identityChain;
    }
}

module.exports = IdentityProviderChain;
