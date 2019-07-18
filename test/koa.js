const koa = require('koa');
const {authenticator, Gateway} = require('./../index');
const FakeIdentityProvider = require('./FakeIdentityProvider');

/**
 * @implements Protocol
 * @implements Mountable
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

    mount(consumer) {
        return async (context, next) => {
            return consumer({context, next});
        };
    }
}


const gateway = new Gateway(new KoaProtocol(), new FakeIdentityProvider());


authenticator.use('local', gateway);

const app = new koa();

app
    .use(authenticator.guard('local'))
    .use(context => context.body = context.identity)
;

app.listen(8080);
