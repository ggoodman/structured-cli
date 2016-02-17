var Category = require('./category');
var Util = require('util');


module.exports = App;


function App(config) {
    Category.call(this, 'app', config);
}

Util.inherits(App, Category);
