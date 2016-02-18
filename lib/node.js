var Assert = require('assert');
var Bluebird = require('bluebird');
var _ = require('lodash');


module.exports = Node;

/**
 * Represents a node in the tree of commands and categories of a CLI application
 */
function Node(name, config) {
    config = _.extend({}, config);
    
    this.config = config;
    this.name = name;
    this.description = config.description;
    this.options = {};
    this.optionGroups = {};
    this.parent = null;
    this.plugins = [];
    this.version = config.version;
    this.epilog = config.epilog;
    
    _.forEach(config.options, _.bind(_.rearg(this.addOption, 1, 0), this));
    _.forEach(config.optionGroups, _.bind(_.rearg(this.addOptionGroup, 1, 0), this));
    _.forEach(config.plugins, _.bind(this.addPlugin, this));
}

Node.prototype.addOption = function(name, options) {
    Assert.ok(typeof name === 'string', '`name` must be a string');
    Assert.ok(typeof options === 'object', '`options` must be an object');
    
    if (options.group) {
        if (!this.optionGroups[options.group]) {
            this.addOptionGroup(options.group);
        }
        
        this.optionGroups[options.group][name] = _.omit(options, 'group');
    } else {
        this.options[name] = options;
    }
};

Node.prototype.addOptionGroup = function(title, options) {
    Assert.ok(typeof title === 'string', '`name` must be a string');
    Assert.ok(!Object.hasOwnProperty.call(this.optionGroups, title), 'The option group `' + title + '` already exists');
    
    this.optionGroups[title] = {};
    
    _.forEach(options, addOption.bind(this));
    
    
    function addOption(options, name) {
        this.addOption(name, _.extend({}, options, { group: title }));
    }
};

Node.prototype.addPlugin = function(plugin) {
    Assert.ok(typeof plugin === 'object', '`plugin` must be an object');
    
    this.plugins.push(plugin);
};


/**
 * Abstract method for configuring how this node behaves
 * 
 * @abstract
 */
Node.prototype.configure = function (parser) {
    Assert.ok(false, 'The `configure` method of `Node` nodes should never be called directly');
};

Node.prototype.runPlugins = function (event, data) {
    var handlers = _(this.plugins)
        .map(event)
        .filter(_.isFunction)
        .value();
    
    return Bluebird.bind(this, handlers)
        .each(runHandler);
    
    
    function runHandler(handler) {
        return handler(data);
    }
};

/**
 * Set the parent of this node
 */
Node.prototype.setParent = function (parent) {
    this.parent = parent;
};
