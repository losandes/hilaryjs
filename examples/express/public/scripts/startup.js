/*globals spa, console*/

(function (spa) {
    "use strict";
    
    var compose,
        start;
    
    compose = function (scope) {
        // compose the dependency graph here
    };
    
    start = function () {
        compose(spa);
        spa.resolve('myFactory');
    };
    
    start();
    
}(spa));
