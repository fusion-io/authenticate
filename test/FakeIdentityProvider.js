/**
 *
 * @implements IdentityProvider
 */
class FakeIdentityProvider {

    async provide({username}) {

        if (username !== "rikky") {
            return false;
        }

        return {name: 'rikky'};
    }
}

module.exports = FakeIdentityProvider;
