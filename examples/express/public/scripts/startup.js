/*globals Hilary, console*/
(function (spa) {
    "use strict";
    
    var compose,
        start;
    
    compose = function () {
        // compose the dependency graph here
    };
    
    (function () {
        compose();
        spa.resolve('myFactory');
    }());
    
}(Hilary.scope('spa')));
