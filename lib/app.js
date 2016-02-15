var Category = require('./category');
var Util = require('util');


module.exports = App;


function App(options) {
    Category.call(this, 'app', options);
}

Util.inherits(App, Category);
