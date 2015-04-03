/*global Hilary, console*/
Hilary.scope('spa').register({
    name: 'myFactory',
    dependencies: ['module1', 'module2', 'jQuery'],
    factory: function (mod1, mod2, $) {
        "use strict";
        
        console.log('module1 loaded:', mod1.isModule1);
        console.log('module2 loaded:', mod2.isModule2);
        console.log('jQuery loaded:', typeof $ === 'function');
        
        $('#results').append('<p>module1 loaded: ' + mod1.isModule1 + '</p>');
        $('#results').append('<p>module2 loaded: ' + mod2.isModule2 + '</p>');
        $('#results').append('<p>jQuery loaded: ' + (typeof $ === 'function') + '</p>');

        return {
            module1: mod1,
            module2: mod2
        };
    }
});
