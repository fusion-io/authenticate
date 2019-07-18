const express = require('express');
const {authenticator, Gateway} = require('./../index');
const FakeIdentityProvider = require('./FakeIdentityProvider');

/**
 * @implements Protocol
 * @implements Mountable
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
        return (request, response, next) => {
            return ({request, response, next})
        };
    }
}



const gateway = new Gateway(new ExpressLocalProtocol(), new FakeIdentityProvider());

authenticator.gateways.set('local', gateway);

const app = new express();

app
    .use(authenticator.guard('local'))
    .use((request, response) => {
        response.json(request.identity);
    })
;

app.listen(9000);