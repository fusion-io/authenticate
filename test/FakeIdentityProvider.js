module.exports = class FakeIdentityProvider {

    provide({username}) {

        if (username !== "rikky") {
            return false;
        }

        return {name: 'rikky'};
    }
};
