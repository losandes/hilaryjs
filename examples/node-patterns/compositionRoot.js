/*jslint node: true*/
var compose,
    start;

compose = function (scope) {
    "use strict";
};

start = function () {
    "use strict";
    
    var Hilary = require('hilary'),
        scope = new Hilary();
    
    compose(scope);
};
