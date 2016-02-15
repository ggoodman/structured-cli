var Node = require('./node');
var Util = require('util');
var _ = require('lodash');



module.exports = Command;



/**
 * Represents a named command
 * 
 * @constructor
 * @augments Node
 * @param {String} name - Name of this command
 * @param {Object} options - Configure the command
 * @param {string} [options.description] - Description of the command
 * @param {Object.<string, Command~Option>} [options.options] - Options for this command
 * @param {Command~handlerFn} options.handler - The command handler to be invoked when matched
 */
function Command(name, options) {
    Node.call(this, name, options);
}

/**
 * Commandline option definition for a {@link Command}
 * 
 * @typedef {Object} Command~Option
 * @property {string} [action] - Action to take when this option is see {@link https://www.npmjs.com/package/argparse#action-some-details|Action}
 * @property {Array<string>} [choices] - Array of valid choices
 * @property {*} [defaultValue] - The default value to assign this property when missing
 * @property {string} [metavar] - The text representation for this option's parameter(s) in the help view
 * @property {boolean} [required=false] - Whether the option is required or not
 * @property {string} [description] - The description of this option
 * @property {string} [dest] - The property where this option should be recorded in the args object passed to your {@link Command~Handler|handlerFn}
 */

/**
 * Handler function for a {@link Command}
 * 
 * @callback Command~Handler
 * @param {Object} args - The parsed arguments
 */


Util.inherits(Command, Node);

Command.prototype.configure = function (parser) {
    _.map(this.options.options, configureOption);
    _.map(this.options.params, configureParam);
        
    parser.setDefaults({ handler: this.options.handler });
    
    function configureOption(options, name) {
        var switches = ['--' + name];
        
        if (options.alias) switches.push('-' + options.alias);
        
        parser.addArgument(switches, {
            action: options.action || (options.type !== 'boolean' ? 'store' : 'storeTrue'),
            choices: options.choices,
            defaultValue: options.defaultValue,
            // type: options.type === 'boolean' ? 'bool' : options.type,
            metavar: options.metavar,
            required: options.required,
            help: options.description,
            dest: options.dest || name,
        });
    }
    
    function configureParam(options, name) {
        var switches = [name];
        
        if (options.alias) switches.push(options.alias);
        
        parser.addArgument(switches, {
            nargs: options.nargs || (options.required ? undefined : '?'),
            defaultValue: options.defaultValue,
            type: options.type,
            help: options.description,
        });
    }
};
