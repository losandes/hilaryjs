/*jslint node: true*/
var Hilary = require('../../index.js'),
    container = new Hilary(),
    compose,
    start;

compose = function (container) {
    "use strict";
    
    container.register({ name: 'http', factory: require('http') });
    container.autoRegister(require('./server.js'));
};

start = function () {
    "use strict";
    
    compose(container);
    container.resolve('server');
};

start();
