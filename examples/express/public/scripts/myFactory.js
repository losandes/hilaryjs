/*global Hilary, console*/
Hilary.scope('spa').register({
    name: 'myFactory',
    // You can either declare your dependencies, or just add arguments that match the dependency names
    // if you want to register a factory and not have the dependencies resolve, set dependencies to an empty array
    // dependencies: ['module1', 'module2', 'jQuery']
    factory: function (module1, module2, $) {
        "use strict";
        
        console.log('module1 loaded:', module1.isModule1);
        console.log('module2 loaded:', module2.isModule2);
        console.log('jQuery loaded:', typeof $ === 'function');
        
        $('#results').append('<p>module1 loaded: ' + module1.isModule1 + '</p>');
        $('#results').append('<p>module2 loaded: ' + module2.isModule2 + '</p>');
        $('#results').append('<p>jQuery loaded: ' + (typeof $ === 'function') + '</p>');

        return {
            module1: module1,
            module2: module2
        };
    }
});
