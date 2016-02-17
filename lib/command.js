var Assert = require('assert');
var Bluebird = require('bluebird');
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
 * @param {Object} config - Configure the command
 * @param {string} [config.description] - Description of the command
 * @param {Object.<string, Command~Option>} [config.options] - Options for this command
 * @param {Command~handlerFn} config.handler - The command handler to be invoked when matched
 */
function Command(name, config) {
    Node.call(this, name, config);
    
    Assert.ok(typeof config.handler === 'function', '`Command` nodes must have a `handler` function');

    this.handler = config.handler;
    this.params = {};

    _.forEach(config.params, _.bind(_.rearg(this.addParam, 1, 0), this));
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

Command.prototype.addParam = function(name, options) {
    Assert.ok(typeof name === 'string', '`name` must be a string');
    Assert.ok(typeof options === 'object', '`options` must be an object');
    
    this.params[name] = options;
};

Command.prototype.configure = function (parser) {
    return Bluebird.bind(this)
        .then(runOnBeforePlugins)
        .then(configureSelf);
    
    
    function runOnBeforePlugins() {
        return this.runPlugins('onBeforeConfigure', {
            node: this,
            parser: parser,
        });
    }
    
    function configureSelf() {
        _.map(this.optionGroups, _.partial(configureGroup, parser));
        _.map(this.options, _.partial(configureOption, parser));
        _.map(this.params, _.partial(configureParam, parser));
        
        parser.setDefaults({ $handler: this.handler, $parser: parser, $node: this });
    }
    
    function configureGroup(parser, options, title) {
        var group = parser.addArgumentGroup({ title: title });
        
        _.map(options, _.partial(configureOption, group));
    }
    
    function configureOption(parser, options, name) {
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
    
    function configureParam(parser, options, name) {
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
