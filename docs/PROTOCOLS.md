@fusion.io/authenticate
-----------------------

# PROTOCOLS


## `HeadlessLocal`

This is just a simple protocol for resolving `username/password`.

```javascript

const { HeadlessLocal } = require('@fusion.io/authenticate');

const protocol = new HeadlessLocal();

// You can also pass an optional options to the constructor

const protocolOptions = {
    usernameField: 'email',
    passwordField: 'pass'
}
```

## `ExpressLocal`

Is a subclass of `HeadlessLocal` protocol, specialized for [express framework](http://expressjs.com)

// TODO


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
