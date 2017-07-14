# structured-cli

Structure your CLI application as a series of nested [Categories](#Categories) and [Commands](#Commands).

## Key Features

* Built off of the proven command-line argument parser [argparse](https://www.npmjs.com/package/argparse).
* Lets you structure your CLI tool as a set of arbitrarily nested [Categories](#Categories) and [Commands](#Commands).
* Lets you easily re-use logic between different commands.
* Makes it easy to alias one command to another.
* Will provide intuitive help without the headache of setting it up.



## Installing it

```bash
npm install structured-cli
```

## Using it

```js
var Cli = require('structured-cli');
var Widgets = require('./widget-service'); // Imaginary api

// The 'root' of our app is an anonymous category
var app = Cli.createApp();

app.addChild(Cli.command('init', {
    description: 'Initialize the tool',
    handler: function (args) {
        // Initialize the tool
    },
}));


// You can nest categories as deep as you would like
var widgets = Cli.category('widgets', {
    description: 'Manage your inventory of widgets.'
});

var listCommand = Cli.command('ls', {
    description: 'List your widgets',
    options: {
        color: {
            alias: 'c'
            description: 'Only list widgets of the given color.',
            type: 'string',
        }
    }
    handler: function (args) {
        Widgets.list(args, function (err, widgets) {
            if (err) throw err; // Thrown errors will print the error
                                // and print the help.
            
            // Pretty-print your list of widgets however you'd like
        });
    }
});

widgets.addChild(listCommand);
// The ls command is now available at `widgets.commands.ls`

// Alias `widgets ls` to the top-level command `widgets ls`
app.addChild(listCommand);

// Add the `widgets` category to the CLI
app.addChild(widgets);

Cli.run(app);
```

## API

TODO

## Usages

This library is used in [wt-cli](https://github.com/auth0/wt-cli).

## Contributing

Just clone the repo, run `npm install` and then hack away.

## Issue reporting
 
If you have found a bug or if you have a feature request, please report them at
this repository issues section. Please do not report security vulnerabilities on
the public GitHub issue tracker. The 
[Responsible Disclosure Program](https://auth0.com/whitehat) details the 
procedure for disclosing security issues.

## License
 
MIT

## What is Auth0?
 
Auth0 helps you to:

* Add authentication with [multiple authentication sources](https://docs.auth0.com/identityproviders), either social like **Google, Facebook, Microsoft Account, LinkedIn, GitHub, Twitter, Box, Salesforce, amont others**, or enterprise identity systems like **Windows Azure AD, Google Apps, Active Directory, ADFS or any SAML Identity Provider**.
* Add authentication through more traditional **[username/password databases](https://docs.auth0.com/mysql-connection-tutorial)**.
* Add support for **[linking different user accounts](https://docs.auth0.com/link-accounts)** with the same user.
* Support for generating signed [Json Web Tokens](https://docs.auth0.com/jwt) to call your APIs and **flow the user identity** securely.
* Analytics of how, when and where users are logging in.
* Pull data from other sources and add it to the user profile, through [JavaScript rules](https://docs.auth0.com/rules).

## Create a free account in Auth0
 
1. Go to [Auth0](https://auth0.com) and click Sign Up.
2. Use Google, GitHub or Microsoft Account to login.
