@fusion.io/authenticate
-----------------------

Better Authentication for better Geeks.


In short, this is an authentication framework.
Much like [PassportJS](http://www.passportjs.org/).

Concepts: tl;dr

 - **Authentication** is about providing an **Identity** for a **Credential**.
 Not checking if some one has logged in or not, where:

    - **Credential** is a piece of information that is made/sent from the third party system/user to proof that the Application/System know who they are.
    It can be a login form with **id** and **password**, or an **access_token**.

    - **Identity** is a piece of information that Application/System can use **by itself** without asking any third party system to know who/which/what is interacting.
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


 - **Authentication** is an important part, but **NOT** all of Security problems.
 A good implementation of **Authentication** does not mean your Application/System is secure