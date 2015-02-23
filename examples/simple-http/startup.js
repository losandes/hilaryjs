/*jslint node: true*/
var Hilary = require('../../index.js'),
    scope = new Hilary(),
    compose,
    start;

compose = function (scope) {
    "use strict";

    scope.register({
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
    scope.register(require('./www.js'));
};

start = function () {
    "use strict";

    compose(scope);
    scope.resolve('server');
};

start();
