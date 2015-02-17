/*globals spa, console*/
spa.resolve(function (resolve, exports, window) {
    "use strict";
    
    var compose,
        start;
    
    compose = function (container) {
        container.register('myFactory', function () {
            var module1 = resolve('module1'),
                module2 = resolve('module2');
            
            console.log('module1 loaded:', module1.isModule1);
            console.log('module2 loaded:', module2.isModule2);
            
            return {
                module1: module1,
                module2: module2
            };
        });
    };
    
    start = function () {
        compose(spa);
        spa.resolve('myFactory');
    };
    
    start();
});
