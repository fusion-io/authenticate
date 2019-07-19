/**
 *
 * @implements IdentityProvider
 */
class FakeIdentityProvider {

    async provide(credential) {

        console.log(credential);

        return {name: 'rikky'};
    }
}

module.exports = FakeIdentityProvider;
