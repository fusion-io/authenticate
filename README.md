@fusion.io/authenticate
-----------------------

Better Authentication for better Geeks.


In short, this is an authentication framework for Node.JS

Much like [PassportJS](http://www.passportjs.org/).  😛

# GETTING STARTED

*For quick and dirty and lazy work with this package. Please check our [supported Gateways](docs/GATEWAYS.md)*

To get start, please follow these steps:

1. [Installation](#installation).
2. [Determine the authentication Protocol(s)](#determine-the-authentication-protocols).
3. [Making Identity Provider(s)](#making-identity-providers).
4. [Register your gateway with Protocol and Identity Provider](#register-your-gateway-with-protocol-and-identity-provider).
5. [Guard your resources](#guard-your-resources).

For further topics, please checkout:

- [Some best practices about authentications](docs/BEST_PRACTICES.md).
- [Document about making a Protocol](docs/PROTOCOLS.md#writing-custom-protocol).
- [Our core concepts when building this package](docs/CONCEPTS_AND_DEFINITIONS.md).
- [Reasons why](docs/REASONS_WHY.md) we love and leave [PassportJS](http://www.passportjs.org/).


## Installation

To install this package, please run:

```javascript
npm install --save @fusion.io/authenticate
```

## Determine the authentication Protocol(s)

`Hey! hey! What is protocol?`

*If you're asking, a Protocol is just a service that can read the user's authentication
information (`Credential`) from your app. Just it!*

There are variety protocols out there and it is hard to choose!
But not so many that are widely accepted and adopted.

So we are here to help you go shopping!

- If you just want to authenticate your user by `email`/`username`/`phone number`/`whatever...` and password.
You should use the `Local` protocol.

- If you also want to let the user can authenticate and login to your application via social networks.
Like Facebook, Google, Linkedin, ...
Most of them are supporting `OAuth2` protocol. So it will be your choice.

- If you also provide API endpoints and you want to protect that resources, we suggest that you should use
token. So let's add `Token` into your shopping cart!

This step is just it. No code! Just cheap talk! :D

## Making Identity Provider(s).

`Hey! hey! What is Identity Provider?`

*Again, if you're asking, an Identity Provider is just a service that translates the credential of the above step
into user's `Identity` (or user id or something that you can use to distinguish one user to others).*

Let's check your shopping cart.

If you are using `Local` protocol. Your Identity Provider should look like:

```javascript

class MyLocalUserProvider {

    async provide({username, password}) {
        // Here you can find your user
        // Do some password verification.

        // and the last thing is:

        return user.id; // Or .email .phonenumber .whatever...
    }
}
```

If you are using `OAuth2` protocol, your Identity Provider should look like:

```javascript

class MyOAuth2kUserProvider {

    async provide({access_token}) {
        // Here you can use the access_token to ask
        // the related social network for the user's
        // profile and of course, user id.

        // and ...
        return user.id;
    }
}

```

If you are using `Token` protocol, your Identity Provider should look like:

```javascript

class MyApiUserProvider {

    async provide({token}) {
        // Here you can use the token to find your user.

        // and again:

        return user.id;
    }
}

```

In general, your Identity provider is nothing special but a class with an `async provide(credential)` method.

Where `credential` is the information that you'll get from the protocol.

## Register your gateway with Protocol and Identity Provider

Now let's mixed up your Identity Provider and protocol.

```javascript

const { authenticator, HeadlessLocal } = require('@fusion.io/authenticate');

// or ES6:

import { authenticator, HeadlessLocal } from "@fusion.io/authenticate";

authenticator.gate('local', new HeadlessLocal(), MyLocalUserProvider());
```

In the example code above, we've registered a gateway called `local` with [`HeadlessLocal`](docs/PROTOCOLS.md#headlesslocal) protocol and your `MyLocalUserProvider` identity provider.

We supports 3 basic protocols for you:

[`HeadlessLocal`](docs/PROTOCOLS.md#headlesslocal), [`HttpOAuth2`](docs/PROTOCOLS.md#httpoauth2) and [`HttpTokenBearer`](docs/PROTOCOLS.md#httptokenbearer)
. You can replace the above [`HeadlessLocal`](docs/PROTOCOLS.md#headlesslocal) to any one of them.

*For more usage of Protocol, please check out the [Protocols documentation](docs/PROTOCOLS.md).*

You can have as many gates as you want.
Just use the `authenticator.gate(gateName, protocol, identityProvider);` to register a new gate.

## Guard your resources

Now, your gate is ready, let's guard your resource with your gate.

```javascript

const { UnAuthenticated, Aborted } = require('@fusion.io/authenticate');

// or ES6

import { UnAuthenticated, Aborted } from "@fusion.io/authenticate";

...

// Some where inside your code.

try {
    let userIdentity = await authenticator.authenticate('local', {username: 'rikky', password: 'Won\'t tell ya!'} );

    // Here is a safezone. User already authenticated
    // You can perform any thing on your resource here!

} catch (error) {
    if (error instanceof UnAuthenticated) {
        // Here is not a safe zone. User is unauthenticated.
    }

    if (error instanceof Aborted) {
        // Here is weird zone. The Protocol decided to abort
        // authentication step.
    }

    // Here is crazy zone. Some thing went wrong! you better throw the
    // error out for debugging.
    throw error;
}

```

### Good news for `Koa`, `Express`, `Socket.IO` users!

We love `middleware` style! If you are using above frameworks,
you'll have a very nice place to guard your resources. The mighty `middleware`:

```javascript

// For example, here we'll wrap the `.authenticate()` method inside a Koa middleware.

const localAuthentication = async (context, next) => {
    try {
        let userIdentity = await authenticator.authenticate('local', context.request.body);

        context.identity = userIdentity;
        await next();

    } catch (error) {
        if (error instanceof Aborted) {
            return;
        }
        throw error;
    }
}


// So now, we can do something like:


app.use(localAuthentication);

```


And for your laziness, we also wrapped it. So beside [`HeadlessLocal`](docs/PROTOCOLS.md#headlesslocal), [`HttpOAuth2`](docs/PROTOCOLS.md#httpoauth2) and [`HttpTokenBearer`](docs/PROTOCOLS.md#httptokenbearer) we have
[`ExpressLocal`](docs/PROTOCOLS.md#expresslocal),
[`KoaLocal`](docs/PROTOCOLS.md#koalocal),
[`SocketIOLocal`](docs/PROTOCOLS.md#socketiolocal),
[`KoaOAuth2`](docs/PROTOCOLS.md#koaoauth2-and-expressoauth2),
[`ExpressOAuth2`](docs/PROTOCOLS.md#koaoauth2-and-expressoauth2),
[`KoaToken`](docs/PROTOCOLS.md#koatoken-and-express-token),
[`ExpressToken`](docs/PROTOCOLS.md#koatoken-and-express-token),
[`SocketIOToken`](docs/PROTOCOLS.md#socketiotoken),
[`KoaSession`](docs/PROTOCOLS.md#koasession-and-expresssession),
[`ExpressSession`](docs/PROTOCOLS.md#koasession-and-expresssession).

These are framework specific protocols.
It have ability to `mount` to your framework as a middleware and `guard` its endpoints.

You can replace the above code by simple `authenticator.guard()` method:

```javascript

// For koa:
//
// app or router
app.use(authenticator.guard('local'));
// Then you can get the identity by accessing `context.identity`.

// For express:
//
// app or router
app.use(authenticator.guard('local'));
// Then you can get the identity by accessing `request.identity`.

// For Socket.IO:
//
// socket or namespace
socket.use(authenticator.guard('local'));
// Then you can get the identity by accessing `socket.identity`.

```


### Good news for users don't find a suitable protocol.

So if you don't think these above protocols are suitable, and you decided to write one for you.
That's great! Now you are becoming seriously! Please check the [CUSTOM PROTOCOL](docs/PROTOCOLS.md#writing-custom-protocol) part.


### Tips:

- **Gateway** is a unit of work that combines a protocol and an identity provider together.
It's the building block of authentication process.
**Authenticator** is just a service that managing gates. Just it!
- Relationship between **Protocol** and **IdentityProvider** is many-to-many.
**Gateway** is a pivot representing that relationship.
- You can have many **Protocols** that sharing the same **Identity Provider** if they providing the same `Credential`.

    For example: *your application may support `token` authentication via web APIs.
And you also want to support `token` authentication via WebSocket.
But no matter what the transport layer is, they still returning a `token` as a `Credential`,
using the same **Identity Provider** in this case will enable your ability to authenticate the same user over multiple transport layers.*
- In reverse, you can also have many **Identity Providers** that sharing the same **Protocol** when we have more than one **Type Of User**,
but sharing the same way of authentication (same way of providing `Credential`).

    For example:  *your application may want to authenticate **users** and **organizations** account.
In both cases, they will provide **email** and **password** as `Credential`.
Using the same **Protocol** will help your code DRY by not providing 2 **Protocols** that are identical to each other.*


# BEST PRACTICES

Please checkout some [best practices](docs/BEST_PRACTICES.md) about authentication.

# FOR YOUR LAZINESS:

We ship some common social authentication services:
`Facebook`,
`Google`,
`Instagram`,
`Slack`,
`GitHub`
out of the box. So you may wants to check out [how to have the `Login via XXX` button](docs/GATEWAYS.md).

# CUSTOM PROTOCOL

Please checkout how the [document about making a Protocol](docs/PROTOCOLS.md#writing-custom-protocol).

# CONCEPTS AND DEFINITIONS

Please check out [our concepts](docs/CONCEPTS_AND_DEFINITIONS.md) when building this package.
