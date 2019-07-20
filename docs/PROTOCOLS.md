@fusion.io/authenticate
-----------------------

# PROTOCOLS


## `HeadlessLocal`

This is just a simple protocol for resolving `username/password`.

```javascript

const { HeadlessLocal } = require('@fusion.io/authenticate');

const protocol = new HeadlessLocal();

// You can also pass an optional options to the constructor

const options = {
    usernameField: 'email',
    passwordField: 'pass'
}

const otherLocalProtocol = new HeadlessLocal(options);
```

With this Protocol, you can't use `authenticator.guard()`. You should use the derived protocols of this one:

[`ExpressLocal`](#expresslocal) and [`KoaLocal`](#koalocal).

## `ExpressLocal`

Is a subclass of `HeadlessLocal` protocol, specialized for [express framework](http://expressjs.com).
If you are using `authenticator.guard()`, the protocol by itself will read the `request.body` for the `Credential`.

*Don't forget to use `body-parser`!  😆*

## `KoaLocal`

Is another subclass of  `HeadlessLocal` protocol, specialized for [koa framework](https://koajs.com/).
If you are using `authenticator.guard()`, again, the protocol will try to read from `ctx.request.body`

*And also don't forget to use `body-parser`, again!*

## `SocketIOLocal`

Is another subclass of `HeadlessLocal` protocol, specialized for [SocketIO](https://socket.io/).

But **DON'T** use it! We created it just for Proof - of - Concepts. You better try the [`SocketIOToken`](#socketiotoken).

## `HttpOAuth2`

This is the protocol for HTTP only. So don't try OAuth2 for Socket.IO 😅!

You can pass several options to this protocol.

```javascript

const options = {

    // required options
    clientID        : 'your-client-id',
    clientSecret    : 'your-client-secret',
    host            : 'your-oauth2-server',
    redirectUri     : 'http://your.domain.com/oauth2/callback',

    // optional
    scope           : ['email'] // List of your scopes
    state           : 'your-state'
}
```

One option that you should be noticed is `state`.

You can using a plain string for `state` option. Or you can write your own `StateVerifier`.

Bellow is the `StateVerifier` interface that you should implement:

```ts
/**
 * A service for verifying the an oauth2 state
 */
interface StateVerifier {

    /**
     * Generates the state when the Protocol call the authorize request.
     */
    makeState(): Promise<string>;

    /**
     * Determines if the state responded from the OAuth2 server is valid.
     *
     * @param stateFromOAuth2Server
     */
    verify(stateFromOAuth2Server): Promise<boolean>
}
```

Using `StateVerifier` will help you prevent `CSRF` attack when using `OAuth2` protocol.
So we encourage you write one for it. (TODO I'm also making one for ya! ✌️)

Since with this Protocol, you can't use `authenticator.guard()`.
We also encourage you using derived subclass of this protocol [`KoaOAuth2` and `ExpressOAuth2`](#koaoauth2-and-expressoauth2).

## `KoaOAuth2` and `ExpressOAuth2`

*Please follow configuration of the [`HttpOAuth2`](#httpoauth2). These 2 protocols can be configured exactly the same.*

To use `OAuth2` protocol is a little bit complex. You'll have to define 2 routes.

- One for authorize URL, it will perform a redirect to the `OAuth2` Authorization Server to get the granted `code`.
- One route for exchange that `code` into `access_token`.

```javascript

// Example using express and OAuth2 to let user login via their Facebook account.
// I bet Koa users don't hate me because of not demo the source in Koa.

app.get('/facebook', authenticator.guard('facebook'));

app.get('/facebook/callback',
    authentication.guard('facebook'),
    (request, response) => {

        // TODO
        // now you can access to your facebook user

        let facebookUserId = request.identity;
    });

```

## `HttpTokenBearer`

This is a generic protocol for Http. It will try to read the token from the request by following order:

1. Request's `Authorization` header;
2. Request's `token` key in query string;
3. Request's `token` key in body;

With this Protocol, you can't use `authenticator.guard()`.
Please use its derived protocols [`KoaToken` and `ExpressToken`](#koatoken-and-expresstoken) if you able to do so.

## `KoaToken` and `ExpressToken`

Nothing to do with these protocol. You can just grab it and play!
Of course you can use `authenticator.guard()` with these guys.

## `SocketIOToken`

This protocol is specialized for [`Socket.IO`](https://socket.io).

It will read the `token` from the `socket.handshake.query`.
Of course you can use `authenticator.guard()` with this protocol.


## `KoaSession` and `ExpressSession`

These 2 protocols will read the `Credential` by accessing the `ctx.session` (for koa) and `request.session` (for express).

You can pass to its constructor the key field that will be used to read that `session` object. Default key is `credential`.

```
/// If your session object like this
//
//  session: { userCredential: 'some-user-id' };

const protocol = new ExpressSession('userCredential');
```

# WRITING CUSTOM PROTOCOL

## Definition of a Protocol

- A Protocol is a service that will resolve the `Credential` from a given `context`.
- A `context` is just a POJO (Plain Old Javascript Object)
which contains authentication information and/or other related data and services.

Here is a TypedScript definition of a **Protocol**.

```ts

interface Protocol {

    /**
     * Load (resolve) the credential
     *
     * @param context
     */
    resolve(context: Object): Promise<Credential>;
}
```


## `Mountable` Protocol

If a **Protocol** can expose itself to a specific transport layer (ex: Http, WebSocket, ...).
We will call it is as a **Mountable** Protocol. It will have a `mount()` method that can be used to
mount to the transport layer.

By doing so, it can `consume` the `context` and resolve the `Credential` by itself.

After the authentication process has been finished, a `Mountable` Protocol also binds the found `Identity` back to the context
and finish its job.

*In most cases, `mount()` method will return a `middleware` of a specific transport framework (koa, express, socket.io, or even yargs);*

Here is the TypedScript definition of **Mountable**:

```ts
/**
 * A callback function that consumes the context,
 * runs the authentication and returns the Identity.
 */
interface ContextConsumer { (context): Promise<Identity> }

/**
 * In the most cases, the protocol by itself can resolve
 * the authentication context. If so, it is a Mountable protocol.
 * Which can mount into the transport layer and populate the context.
 *
 */
interface Mountable {
    mount(consumer: ContextConsumer): any;
}
```

***A `Mountable` Protocol usually coupled with one transport framework.***

*You can find other definitions in the [typings file](../typings/auth.d.ts).*

## Implementing the interfaces

So you can create a new **Protocol** by implementing the `Protocol` interface like bellow:

```javascript

/**
 * @implements Protocol
 */
class MyAweSomeProtocol {

    async provide(context) {

        // reading the credential from the given context
        //
        // and then:

        return credential;
    }
}
```

If you want to expose your **Protocol** to a transport framework, let's implement the `Mountable`
interface.


Bellow is the `awesome` example of an protocol that will mount into express framework,
it will read `Credential` from the request header and attach the `Identity` back to that request.

If the authentication was failed, it sends a response with `401` status.

```javascript

import { UnAuthenticated } from "@fusion.io/UnAuthenticated";

/**
 * @implements Protocol
 * @implements Mountable
 */
class MyAweSomeExpressProtocol {

    /**
     *  Now Http Request is the **context** of this Protocol.
     *  Because it was mounted into express.
     */
    async provide(request) {
        const aweSomeCredential = request.get('X-Awesome-Credential');

        if (!aweSomeCredential) {

            // Throwing UnAuthenticated error here
            // will tell the authenticator that the request
            // is not authenticated.
            throw new UnAuthenticated("You are not awesome!");
        }

        return aweSomeCredential;
    }

    /**
     *  Now mount() will return an express middleware.
     *
     */
    mount(consumer) {
        return (request, response, next) => {

            // Calling consumer(request)
            // to tell the Protocol that
            // Http Request now will be its **context**
            consumer(request)

                // Got the identity
                .then(identity => {
                    request.awesomeIdentity = identity;
                    next();
                })

                // Not awesome problem!
                .catch(error => {

                    if (error instance of UnAuthenticated) {
                        return response.status(401).json({
                            message: error
                        });
                    }

                    next(error);
                })
            ;
        }
    }
}
```


Now, it's time to showoff!

```javascript
authenticator.gate('awesome', new MyAweSomeExpressProtocol(), new YourAweSomeUserProvider());

app.get('/im-awe-some',

    // You can now .guard() an express route
    authenticator.guard('awesome'),

    (request, response) => {
        response.json({
            awesome: request.awesomeIdentity
        })
    }
);

app.get('/youre-awe-some', (request, response) => {

    // Or you still can .authenticate() as a standalone service
    authenticator.authenticate('awesome', request)
        .then(awesomeIdentity => {
            response.json({
                awesome: awesomeIdentity
            });
        })
        .catch(error => next(error))
    ;
})

```
