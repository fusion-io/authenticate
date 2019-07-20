@fusion.io/authenticate
-----------------------

Better Authentication for better Geeks.


In short, this is an authentication framework.
Much like [PassportJS](http://www.passportjs.org/).

# GETTING STARTED

To get start, please following one of these steps:

Installation

1. Installation.
2. Determine the authentication Protocol(s).
3. Making Identity Provider(s).
4. Register your gateway with Protocol and Identity Provider.
5. Guard your resources.

## 1. Installation

To install this package, please run:

```javascript
npm install --save @fusion.io/authenticate
```

## 2. Determine the authentication Protocol(s)

`Hey! hey! What is protocol?`

*If you're asking, a Protocol is just a service that can read the user's authentication
information (Credential) from your app. Just it!*

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

## 3. Making Identity Provider(s).

`Hey! hey! What is Identity Provider?`

*Again, if you're asking, an Identity Provider is just a service that translates the credential of the above step
into user identity (or user id or something that you can use to distinguish one user to others).*

Let's check your shopping cart.

If you are using `Local` protocol. Your Identity Provider should looks like

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

If you are using `OAuth2` protocol, your Identity Provider should looks like:

```javascript

class MySocialNetworkUserProvider {

    async provide({access_token}) {
        // Here you can use the access_token to ask
        // the related social network for the user's
        // profile and of course, user id.

        // and ...
        return user.id;
    }
}

```

If you are using `Token` protocol, your Identity Provider should looks like:

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

## 4. Register your gateway with Protocol and Identity Provider

Now let's mixed up your Identity Provider and protocol.

// TBD


But first, what's your framework that's you're using?

If you are using express or any express core frameworks:

```javascript

const { authenticator, ExpressLocal } = require('@fusion.io/authenticate');

// or ES6:

import { authenticator, ExpressLocal } from "@fusion.io/authenticate";

authenticator.gate('local', new ExpressLocal(), MyLocalUserProvider());
```

We'll support `KoaLocal`, `ExpressLocal`, `SocketIOLocal`, `YargsLocal`, `KoaOAuth2`, `ExpressOAuth2`, `KoaToken`, `ExpressToken`.

If you're unlucky and your framework is not in above list. It is also fine!

We have some abstract protocol that might useful for you: `HeadlessLocal`, `HttpOAuth2`, `HttpTokenBearer`



# CUSTOM PROTOCOL

# BEST PRACTICES

# CONCEPTS

# WORDS FROM AUTHOR

We love `PassportJS` but we want to say farewell to it!
