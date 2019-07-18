const koa = require('koa');
const {Authenticator, Gateway} = require('./../index');
const FakeIdentityProvider = require('./FakeIdentityProvider');

/**
 * @implements Protocol
 */
class KoaProtocol {

    resolve({context}) {
        return {
            username: context.query.username,
            password: context.query.password
        };
    }

    async responseAuthenticated(identity, {context, next}) {
        context.identity = identity;
        return await next();
    }

    async responseUnAuthenticated(reason, {context}) {
        context.body = {
            message: "UNAUTHENTICATED",
        };
    }
}


const auth    = new Authenticator();
const gateway = new Gateway(new KoaProtocol(), new FakeIdentityProvider());


auth.gateways.set('local', gateway);

const app = new koa();

app
    .use(auth.mount('local', (context, next) => ({context, next})))
    .use(context => context.body = context.identity)
;

app.listen(8080);