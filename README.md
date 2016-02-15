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

<a name="module_structured-cli"></a>
### structured-cli

* [structured-cli](#module_structured-cli)
    * [~createApp(name)](#module_structured-cli..createApp) ⇒ <code>App</code>
    * [~createCategory(name, [options])](#module_structured-cli..createCategory) ⇒ <code>[Category](#Category)</code>
    * [~createCommand()](#module_structured-cli..createCommand) ⇒ <code>[Command](#Command)</code>
    * [~run()](#module_structured-cli..run) ⇒
    * [~cancelled()](#module_structured-cli..cancelled)
    * [~hint()](#module_structured-cli..hint)
    * [~invalid()](#module_structured-cli..invalid)
    * [~notFound()](#module_structured-cli..notFound)
    * [~timeout()](#module_structured-cli..timeout)

<a name="module_structured-cli..createApp"></a>
#### Cli~createApp(name) ⇒ <code>App</code>
Create an [Application](Application)

**Kind**: inner method of <code>[structured-cli](#module_structured-cli)</code>  
**See**: [App](App)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the application |

<a name="module_structured-cli..createCategory"></a>
#### Cli~createCategory(name, [options]) ⇒ <code>[Category](#Category)</code>
Creates a [Category](#Category)

**Kind**: inner method of <code>[structured-cli](#module_structured-cli)</code>  
**See**: [Category](#Category)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the category |
| [options] | <code>Object</code> | Options for creating the category (see [Category](#Category)) |

<a name="module_structured-cli..createCommand"></a>
#### Cli~createCommand() ⇒ <code>[Command](#Command)</code>
Creates a [Command](#Command)

**Kind**: inner method of <code>[structured-cli](#module_structured-cli)</code>  
**See**: [Command](#Command)  
<a name="module_structured-cli..run"></a>
#### Cli~run() ⇒
Runs a structured-cli [Node](#Node) ([Command](#Command) or [App](App), typically)

**Kind**: inner method of <code>[structured-cli](#module_structured-cli)</code>  
**Returns**: Promise<?>  
<a name="module_structured-cli..cancelled"></a>
#### Cli~cancelled()
Create an `E_CANCELLED` error

**Kind**: inner method of <code>[structured-cli](#module_structured-cli)</code>  
<a name="module_structured-cli..hint"></a>
#### Cli~hint()
Create an `E_HINT` error

**Kind**: inner method of <code>[structured-cli](#module_structured-cli)</code>  
<a name="module_structured-cli..invalid"></a>
#### Cli~invalid()
Create an `E_INVALID` error

**Kind**: inner method of <code>[structured-cli](#module_structured-cli)</code>  
<a name="module_structured-cli..notFound"></a>
#### Cli~notFound()
Create an `E_NOTFOUND` error

**Kind**: inner method of <code>[structured-cli](#module_structured-cli)</code>  
<a name="module_structured-cli..timeout"></a>
#### Cli~timeout()
Create an `E_TIMEOUT` error

**Kind**: inner method of <code>[structured-cli](#module_structured-cli)</code>  
<a name="Command"></a>
### Command ⇐ <code>[Node](#Node)</code>
**Kind**: global class  
**Extends:** <code>[Node](#Node)</code>  

* [Command](#Command) ⇐ <code>[Node](#Node)</code>
    * [new Command(name, options)](#new_Command_new)
    * _instance_
        * *[.configure()](#Node+configure)*
        * [.setParent()](#Node+setParent)
    * _inner_
        * [~Option](#Command..Option) : <code>Object</code>
        * [~Handler](#Command..Handler) : <code>function</code>

<a name="new_Command_new"></a>
#### new Command(name, options)
Represents a named command


| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of this command |
| options | <code>Object</code> | Configure the command |
| [options.description] | <code>string</code> | Description of the command |
| [options.options] | <code>Object.&lt;string, Command~Option&gt;</code> | Options for this command |
| options.handler | <code>Command~handlerFn</code> | The command handler to be invoked when matched |

<a name="Node+configure"></a>
#### *command.configure()*
Abstract method for configuring how this node behaves

**Kind**: instance abstract method of <code>[Command](#Command)</code>  
**Overrides:** <code>[configure](#Node+configure)</code>  
<a name="Node+setParent"></a>
#### command.setParent()
Set the parent of this node

**Kind**: instance method of <code>[Command](#Command)</code>  
<a name="Command..Option"></a>
#### Command~Option : <code>Object</code>
Commandline option definition for a [Command](#Command)

**Kind**: inner typedef of <code>[Command](#Command)</code>  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| action | <code>string</code> |  | Action to take when this option is see [Action](https://www.npmjs.com/package/argparse#action-some-details) |
| choices | <code>Array.&lt;string&gt;</code> |  | Array of valid choices |
| defaultValue | <code>\*</code> |  | The default value to assign this property when missing |
| metavar | <code>string</code> |  | The text representation for this option's parameter(s) in the help view |
| required | <code>boolean</code> | <code>false</code> | Whether the option is required or not |
| description | <code>string</code> |  | The description of this option |
| dest | <code>string</code> |  | The property where this option should be recorded in the args object passed to your [handlerFn](#Command..Handler) |

<a name="Command..Handler"></a>
#### Command~Handler : <code>function</code>
Handler function for a [Command](#Command)

**Kind**: inner typedef of <code>[Command](#Command)</code>  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Object</code> | The parsed arguments |

<a name="Category"></a>
### Category(name, options)
Represents a named category of commands

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | Name of this category |
| options | <code>[Options](#Category..Options)</code> | Options for this category |

<a name="Category..Options"></a>
#### Category~Options : <code>Object</code>
Options definition for a [Category](#Category)

**Kind**: inner typedef of <code>[Category](#Category)</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| description | <code>String</code> | Description of the category |

<a name="Node"></a>
### Node()
Represents a node in the tree of commands and categories of a CLI application

**Kind**: global function  

* [Node()](#Node)
    * *[.configure()](#Node+configure)*
    * [.setParent()](#Node+setParent)

<a name="Node+configure"></a>
#### *node.configure()*
Abstract method for configuring how this node behaves

**Kind**: instance abstract method of <code>[Node](#Node)</code>  
<a name="Node+setParent"></a>
#### node.setParent()
Set the parent of this node

**Kind**: instance method of <code>[Node](#Node)</code>  

## Usages

This library will be used in [wt-cli](https://github.com/auth0/structured-cli).

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
