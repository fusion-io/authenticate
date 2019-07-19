const express = require('express');
const {authenticator, Gateway} = require('./../index');
const FakeIdentityProvider = require('./FakeIdentityProvider');
const { mountExpress } = require('./../lib/utils');
const LocalProtocol = require('./../lib/Protocols/HeadlessLocal');
const ExpressProtocol = mountExpress()(LocalProtocol);
const bp = require('body-parser');

const gateway = new Gateway(new ExpressProtocol(), new FakeIdentityProvider());

authenticator.use('local', gateway);

const app = new express();

app
    .use(bp())
    .use(authenticator.guard('local'))
    .use((request, response) => {
        response.json(request.identity);
    })
    .use((error, request, response, next) => {
        console.log(error);
        response.status(error.code || 500).json(error)
    })
;

app.listen(9000);