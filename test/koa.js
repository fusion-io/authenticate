const koa = require('koa');
const {authenticator, Gateway, mountKoa} = require('./../index');
const FakeIdentityProvider = require('./FakeIdentityProvider');
const TokenBearer = require('./../lib/Protocols/TokenBearer');
const body = require('koa-body');

const KoaProtocol = mountKoa()(TokenBearer);

const gateway = new Gateway(new KoaProtocol(), new FakeIdentityProvider());

authenticator.use('local', gateway);

const app = new koa();

app
    .use(body())
    .use(async (context, next) => {
        try {
            await next();
        } catch (e) {
            context.status = e.code || 500;
            context.body = {
                message: e.message
            }
        }
    })
    .use(authenticator.guard('local'))
    .use(context => context.body = context.identity)
;

app.listen(8080);
