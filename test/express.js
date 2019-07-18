const express = require('express');
const {authenticator, Gateway} = require('./../index');
const FakeIdentityProvider = require('./FakeIdentityProvider');
const { mountExpress } = require('./../lib/utils');

class LocalProtocol {

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
}

const MountableLocalProtocol = mountExpress()(LocalProtocol);

const gateway = new Gateway(new MountableLocalProtocol(), new FakeIdentityProvider());

authenticator.use('local', gateway);

const app = new express();

app
    .use(authenticator.guard('local'))
    .use((request, response) => {
        response.json(request.identity);
    })
;

app.listen(9000);