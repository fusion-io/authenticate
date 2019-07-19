const express = require('express');
const {authenticator, Gateway} = require('./../index');
const FakeIdentityProvider = require('./FakeIdentityProvider');
const { mountExpress } = require('./../lib/utils');
const HttpOAuth2 = require('./../lib/Protocols/HttpOAuth2');
const ExpressProtocol = mountExpress()(HttpOAuth2);
const bp = require('body-parser');

let protocol = new ExpressProtocol();

protocol.setOptions({
    host: 'https://graph.facebook.com',
    clientId: '2414786412178829',
    clientSecret: '5978e8545dd482ae8f3af197fc190c3a',
    redirectUri: 'http://localhost:9000/facebook/callback'
});

const gateway = new Gateway(protocol, new FakeIdentityProvider());

authenticator.use('local', gateway);

const app = new express();

app.use(bp());

app.get('/facebook', authenticator.guard('local'));
app.get('/facebook/callback', authenticator.guard('local'), (request, response) => {
    response.json(request.identity);
});

app.use((error, request, response, next) => {
    response.status(error.code || 401).json({
        message: error.message
    });
    next(error);
});

app.listen(9000);