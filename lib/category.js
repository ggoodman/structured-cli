var Assert = require('assert');
var Bluebird = require('bluebird');
var Node = require('./node');
var Util = require('util');
var _ = require('lodash');


module.exports = Category;

/**
 * Options definition for a {@link Category}
 * 
 * @typedef {Object} Category~Options
 * @property {String} description - Description of the category
 */

/**
 * Represents a named category of commands
 * 
 * @param {String} name - Name of this category
 * @param {Category~Options} options - Options for this category
 */
function Category(name, config) {
    Node.call(this, name, config);
    
    this.children = [];
}

Util.inherits(Category, Node);

Category.prototype.addChild = function (node) {
    Assert.ok(node instanceof Node, '`category` must be an instance of `Node`');
    
    this.children.push(node);

    node.setParent(this);
};

Category.prototype.configure = function (parser) {
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
        this.subparsers = parser.addSubparsers({
            descripion: this.description,
            dest: this.name + '_command',
            title: 'subcommands',
        });
        
        return Bluebird.bind(this, this.children)
            .map(configureChild);
    }
    
    
    function configureChild(child) {
        var childParser = this.subparsers.addParser(child.name, {
            addHelp: !!child.description,
            help: child.description,
        });
        
        return child.configure(childParser);
    }
};
