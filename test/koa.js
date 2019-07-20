const koa = require('koa');
const {authenticator, Gateway, mountKoa} = require('./../index');
const FakeIdentityProvider = require('./FakeIdentityProvider');
const HttpOAuth2 = require('./../lib/Protocols/HttpOAuth2');
const body = require('koa-body');
const Router = require('koa-router');
const router = new Router();

const KoaProtocol = mountKoa()(HttpOAuth2);


let protocol = new KoaProtocol({
    host: 'https://graph.facebook.com',
    clientId: '2414786412178829',
    clientSecret: '5978e8545dd482ae8f3af197fc190c3a',
    redirectUri: 'http://localhost:8080/facebook/callback'
});

const gateway = new Gateway(protocol, new FakeIdentityProvider());

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
            };
            throw e;

        }
    })
    .use(router.routes())
    .use(router.allowedMethods())
;

router.get('/facebook', authenticator.guard('local'));
router.get('/facebook/callback', authenticator.guard('local'), (ctx) => {
    ctx.body = {
        ...ctx.identity
    }
});


app.listen(8080);
