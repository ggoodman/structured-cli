var App = require('./app');
var Argparse = require('argparse');
var Assert = require('assert');
var Bluebird = require('bluebird');
var Category = require('./category');
var Command = require('./command');
var Node = require('./node');
var Util = require('util');
var _ = require('lodash');


exports.createApp = createApp;
exports.createCategory = createCategory;
exports.createCommand = createCommand;
exports.run = run;


exports.error = {
    badRequest: badRequest,
    cancelled: cancelled,
    hint: hint,
    invalid: invalid,
    notFound: notFound,
    serverError: serverError,
    timeout: timeout,
};




// Exported interface

/**
 * Create an {@link Application}
 * 
 * @param {string} name Name of the application
 * @returns {App}
 * @see {@link App}
 */
function createApp(options) {
    return new App(options);
}

/**
 * Creates a {@link Category}
 * 
 * @param {string} name - Name of the category
 * @param {Object} [options] - Options for creating the category (see {@link Category})
 * @returns {Category}
 * @see {@link Category}
 */
function createCategory(name, options) {
    return new Category(name, options);
}

/**
 * Creates a {@link Command}
 * @returns {Command}
 * @see {@link Command}
 */
function createCommand(name, options) {
    return new Command(name, options);
}


/**
 * Runs a structured-cli {@link Node} ({@link Command} or {@link App}, typically)
 * 
 * @returns Promise<?>
 */
function run(node, options) {
    Assert.ok(node instanceof Node, 'A CLI `Node` must be passed to run');
    
    if (!options) options = {};
    
    var parser = new Argparse.ArgumentParser(_.defaults(this.options, {
        addHelp: true,
        version: node.version,
        description: node.description,
        epilog: node.epilog,
        formatterClass: CustomHelpFormatter,
    }));
    
    return Bluebird.resolve(node)
        .call('configure', parser)
        .return(parser)
        .then(runOnBeforeHandlerPlugins)
        .then(invokeHandler);
    
    
    function runOnBeforeHandlerPlugins(parser) {
        var args = parser.parseArgs();
        var node = args.$node;
        var ready$ = Bluebird.bind(node, node.runPlugins('onBeforeHandler', {
            args: args,
            node: node,
            parser: args.$parser,
            handler: args.$handler,
        }));
        
        return ready$
            .return(args);
    }
    
    function invokeHandler(args) {
        return Bluebird.bind(args.$node, args)
            .call('$handler', args)
            .catch(function (e) {
                e.parser = args.$parser;
                e.node = args.$node;
                e.handler = args.$handler;
                
                throw e;
            });
    }
}

// Error constructors

/**
 * Create an `E_BADREQUEST` error
 */
function badRequest(message, data) {
    return createError(message, 'E_BADREQUEST', data, badRequest);
}

/**
 * Create an `E_CANCELLED` error
 */
function cancelled(message, data) {
    return createError(message, 'E_CANCELLED', data, cancelled);
}

/**
 * Create an `E_HINT` error
 */
function hint(message, data) {
    return createError(message, 'E_HINT', data, hint);
}

/**
 * Create an `E_INVALID` error
 */
function invalid(message, data) {
    return createError(message, 'E_INVALID', data, invalid);
}

/**
 * Create an `E_NOTFOUND` error
 */
function notFound(message, data) {
    return createError(message, 'E_NOTFOUND', data, notFound);
}

/**
 * Create an `E_SERVERERROR` error
 */
function serverError(message, data) {
    return createError(message, 'E_SERVERERROR', data, serverError);
}

/**
 * Create an `E_TIMEOUT` error
 */
function timeout(message, data) {
    return createError(message, 'E_TIMEOUT', data, timeout);
}


// Private helper functions

function createError(message, code, data, ctor) {
    var error = new Error(message ? message : undefined);
    
    Error.captureStackTrace(error, ctor);
    
    error.code = code;
    error.data = data;
    error.isCli = true;
    
    return error;
}


function CustomHelpFormatter(options) {
    Argparse.HelpFormatter.call(this, _.defaults(options, {
        width: process.stdout.columns,
    }));
}

Util.inherits(CustomHelpFormatter, Argparse.HelpFormatter);

CustomHelpFormatter.prototype._splitLines = function (text, width) {
  var lines = [];
  var delimiters = [ ' ', '.', ',', '!', '?' ];
  var re = new RegExp('[' + delimiters.join('') + '][^' + delimiters.join('') + ']*$');

  text = text.trim();

  // Wraps the single paragraph in text (a string) so every line
  // is at most width characters long.
  text.split('\n').forEach(function (line) {
    if (width >= line.length) {
      lines.push(line);
      return;
    }

    var wrapStart = 0;
    var wrapEnd = width;
    var delimiterIndex = 0;
    while (wrapEnd <= line.length) {
      if (wrapEnd !== line.length && delimiters.indexOf(line[wrapEnd] < -1)) {
        delimiterIndex = (re.exec(line.substring(wrapStart, wrapEnd)) || {}).index;
        wrapEnd = wrapStart + delimiterIndex + 1;
      }
      lines.push(line.substring(wrapStart, wrapEnd));
      wrapStart = wrapEnd;
      wrapEnd += width;
    }
    if (wrapStart < line.length) {
      lines.push(line.substring(wrapStart, wrapEnd));
    }
  });

  return lines;
};