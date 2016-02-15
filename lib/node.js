module.exports = Node;

/**
 * Represents a node in the tree of commands and categories of a CLI application
 */
function Node(name, options) {
    this.name = name;
    this.options = options;
    this.parent = null;
}

/**
 * Abstract method for configuring how this node behaves
 * 
 * @abstract
 */
Node.prototype.configure = function (parser) { throw new Error('Abstract method must be overloaded'); };

/**
 * Set the parent of this node
 */
Node.prototype.setParent = function (parent) {
    this.parent = parent;
};
