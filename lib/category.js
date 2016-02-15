var Assert = require('assert');
var Command = require('./command');
var Node = require('./node');
var Util = require('util');



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
function Category(name, options) {
    Node.call(this, name, options);
    
    this.children = [];
}

Util.inherits(Category, Node);

Category.prototype.addChild = function (node) {
    Assert.ok(node instanceof Node, '`category` must be an instance of `Node`');
    
    this.children.push(node);

    node.setParent(this);
};

Category.prototype.configure = function (parser) {
    this.subparsers = parser.addSubparsers({
        descripion: this.options.description,
        dest: 'cat_' + this.name,
        title: 'subcommands',
    });
    
    this.children.forEach(configureChild, this);
    
    
    function configureChild(child) {
        var parser = this.subparsers.addParser(child.name, {
            addHelp: !!child.options.description,
            help: child.options.description,
        });
        
        child.configure(parser);
    }
};
