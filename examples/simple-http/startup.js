/*jslint node: true*/
var Hilary = require('../../index.js'),
    container = new Hilary(),
    compose,
    start;

compose = function (container) {
    "use strict";

    container.register({
        name: 'http',
        factory: function () {
            var isWin = /^win/.test(process.platform);
            
            if (isWin) {
                // take advantage of the httpsys performance enhancements
                return require('httpsys');
            } else {
                // otherwise, stick with the standard http module
                return require('http');
            }
        }
    });
    container.register(require('./www.js'));
};

start = function () {
    "use strict";

    compose(container);
    container.resolve('server');
};

start();
