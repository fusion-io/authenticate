@fusion.io/authenticate
-----------------------

Better Authentication for better Geeks.


In short, this is an authentication framework.
Much like [PassportJS](http://www.passportjs.org/).

Concepts: tl;dr

 - **Authentication** is about providing an **Identity** for a **Credential**.
 Not checking if some one has logged in or not, where:

    - **Credential** can be a login form with **id** and **password**, or **access_token**.

    - **Identity** is the piece of information that Application/System can use **by itself** to know who/which/what is interacting .
    For example: the primary key value of an user table.


 - **Authentication** only have meaning if we provide an **Authentication Context**.
 It is a place that authentication happened for a purpose.
 It contains **Credential** information.
 It can transport information back and forth.

 - **Authentication** can be separated into 2 steps:

    1. Reading the **Credential** from **Authentication Context**.

    2. Finding the related **Identity** with such **Credential**.

 - The first step will be coupled with authentication standard (OpenID, OAuth2).
 It also coupled with transport protocol (HTTP, Websocket, Console ...),
 which also mean it depends on the transport framework: **Koa**, **Express** / Http, **Socket.IO** / Websocket, ...
 It should not couple with the Application/System domain nor the second step.
 Implementations of the first step can be reuse in a form of libraries or frameworks.

 - The second step will be coupled with the application domain. It should be implemented by the developer.

