@fusion.io/authenticate
-----------------------

# PREDEFINED GATEWAY

*People are lazy. So I'll go short here.*

We supported some built-in gateways, you can use it with your `authenticator`.

For OAuth2 based services, your **Identity Provider** will not only get
the `access_token` but also get the `profile` field.

For example:

```javascript

class MyFacebookIDP {

    async provide({access_token, profile}) {
        // Now you can get not only access_token but also profile
        // It should be the user's facebook profile.

        // Depending on `scope` config, it will contains more or less values.

        ...
    }
}
```

Now, you can register the Facebook authentication gateway by doing this:

```javascript
import { createExpressGateway } from "@fusion.io/authenticate/gateways/facebook";

// Or for Koa
// import { createKoaGateway } from "@fusion.io/authenticate/gateways/facebook";

import { authenticator } from "@fusion.io/authenticate";

const options = {

    // Required config
    // You better use the environment variables
    // to store the values.
    clientId     : process.env.FACEBOOK_APP_ID,
    clientSecret : process.env.FACEBOOK_APP_SECRET,
    redirectUri  : process.env.FACEBOOK_REDIRECT_URI, // http://localhost:3000/facebook/callback

    // Optional config
    // its default value was 3.3
    graphAPIVersion : '3.3',

    // Optional config, you still can set the scope
    //
    scope: 'email'
}

// Using .register() to add an existing gateway to your authenticator
authenticator.register('facebook', createExpressGateway(options, new MyFacebookIDP()));
```

And now you can use the `facebook` gateway with ease by:

```javascript

app.get('/facebook', authenticator.guard('facebook'));

app.get('/facebook/callback', authenticator.guard('facebook'), (request, response) => {

    response.json({

        // Here, request.identity is the
        // the identity of the user who logging in
        // by facebook.
        identity: request.identity

        // If you are using Koa, you can access
        // the identity by ctx.identity, simple right?
    });
});


```

Similar to `Facebook`, here we shipped:

|Gateway|BasedProtocol|Specific Config|Notes|
|-------|-------------|---------------|-----------|
|GitHub|OAuth2| `{ ua: 'string' }`| `ua`: Your custom User Agent. Ex: `X-My-Awesome-App`|
|Google|OAuth2| `{ scope: 'openid email' }` | You always need scope when using Google|
|Slack|OAuth2|-|Slack Gateway also returning `team`|
|Instagram|OAuth2|-|-|
|Twitter|OAuth 1.0a|-|-|
|jwt|Json web token|`privateKey`| calling `createXXXGateway(privateKey)` to set the private key. `payload` field will be returned in side the IDP|


Other gates will be added in the future. PRs are also welcome :)