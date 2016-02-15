var App = require('./app');
var ArgumentParser = require('argparse').ArgumentParser;
var Bluebird = require('bluebird');
var Category = require('./category');
var Command = require('./command');
var Node = require('./node');
var _ = require('lodash');


/**
 * @module structured-cli
 * @typicalname Cli
 */

exports.createApp = createApp;
exports.createCategory = createCategory;
exports.createCommand = createCommand;
exports.run = run;


exports.error = {
    cancelled: cancelled,
    hint: hint,
    invalid: invalid,
    notFound: notFound,
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
    if (!(node instanceof Node)) {
        throw new Error('A CLI `Node` must be passed to run');
    }
    
    if (!options) options = {};
    
    var parser = new ArgumentParser(_.defaults(this.options, {
        addHelp: true,
    }));
    
    node.configure(parser);
    
    var args = parser.parseArgs();
    
    if (!(typeof args.handler === 'function')) {
        parser.printHelp();
        process.exit(1);
    }
    
    var promise$ = Bluebird.try(function () {
        return args.handler(args);
    })
        .timeout(options.timeout || 30 * 60 * 1000, 'reached maximum execution time disconnecting');
    
    promise$
        .catch(Bluebird.TimeoutError, function (err) {
            console.error(err.message);
            
            process.exit(1);
        })
        .catch(_.matchesProperty('code', 'E_INVALID'), function (err) {
            parser.error(err.message);
            
            // argparse triggers `process.exit(2)`
        })
        .catch(_.matchesProperty('code', 'E_HINT'), function (err) {
            console.error(err.message);
            
            process.exit(3);
        })
        .catch(function (err) {
            console.error('Uncaught error: ', err.message);
            console.error(err.stack);
            console.error('Please report this at: https://github.com/auth0/wt-cli/issues');
            
            process.exit(4);
        })
        .then(function () {
            process.exit(0);
        });
}

// Error constructors

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
 * Create an `E_TIMEOUT` error
 */
function timeout(message, data) {
    return createError(message, 'E_TIMEDOUT', data, timeout);
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