@fusion.io/authenticate
-----------------------

# BEST PRACTICES

## Keep your **Identity Provider** clean
You can think of it as a connection to extract user's from the system. But
**NEVER** let your **Identity Provider** depends on your transport layer.

One of the **BAD** example is saving the found identity into Session.
Session is a concept of HTTP layer, we don't want the **Identity Provider** aware about
the current transport layer that it is working on.

```javascript

class MyUserIdentityProvider {

    provide({username, password}) {


        // DON'T do this. Just please don't!
        session.user = user;

        return user;
    }
}

```

We will store the user into session, but that code should not be written inside of **IdentityProvider**.
Let's do it **after** the authentication success.

## Understanding `Identity` and `Credential`.

Okay, maybe you think that I'm joking!
But sometimes, we mis-understanding these 2 concepts.
Especially when we working with third party services.

In **OAuth2** protocol, someone (but not you!) think that `access_token` is just a token.
But it is ACTUALLY the `Credential`.
The **Identity Provider** will provide user identity by calling API to the OAuth2 server with that `access_token`.

Other of common mistake is about `token` is when your application providing APIs.
At first, the user login (and their `username`, `password` is `Credential`, everybody knows it).
But what next is tricky part. You might provide the `token` for the user after logging in, so they can
use that `token` to call your API later. And believe me or not, someone (but not you) think that `token` is `Identity`
*But in this scenario `token` IS `Credential`. Not everyone understand it!*

Whatever comes in your `.provide()` is the `Credential`, and whatever comes out is `Identity`.

## Treating the `Credential` with cautions.

- `Credential` is user's privacy, it is private and sensitive.

- **DO** encrypt the `Credential` whenever you store it. Not only the `user's password`, but also your api `token`!

- **DO** verify the origin of the `Credential` each time you have it!
    In the Local case, we have the `username` field, so we can query back in our database if we have such `username`.
    It is one way of verifying the origin of the `Credential`.
    In **OAuth2** case, `access_token` will be used to query to the OAuth2 server, it also a mechanism to verify the origin.
    In `token` case, if you can, when you generate it in the first time, please **sign** it with your private key,
    so later you can check the signature to verify the origin.

- In many webservices whenever you use it you will be provided 2 keys, one `public key` and one `secret key`.
You can think of your `public key` is `Identity` and `private key` is `Credential`. Also keep your `private key` in your pocket!


## `Error` is not nutrition. Don't swallow it!

// TODO