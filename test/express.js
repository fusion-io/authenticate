const express = require('express');
const {Authenticator, Gateway} = require('./../index');
const FakeIdentityProvider = require('./FakeIdentityProvider');

/**
 * @implements Protocol
 */
class ExpressLocalProtocol {

    resolve({request}) {
        return {
            username: request.query.username,
            password: request.query.password
        };
    }

    responseAuthenticated(identity, context) {
        context.request.identity = identity;
        context.next()
    }

    responseUnAuthenticated(reason, context) {
        context.response.status(401).json({
            message: "UNAUTHENTICATED"
        })
    }

    mount(consumer) {
        return undefined;
    }
}


const auth    = new Authenticator();
const gateway = new Gateway(new ExpressLocalProtocol(), new FakeIdentityProvider());


auth.gateways.set('local', gateway);

const app = new express();

app
    .use(auth.mount('local', (request, response, next) => ({request, response, next})))
    .use((request, response) => {
        response.json(request.identity);
    })
;

app.listen(9000);