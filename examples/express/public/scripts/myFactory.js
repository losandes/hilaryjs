/*global spa, console*/
spa.register({
    name: 'myFactory',
    dependencies: ['module1', 'module2', 'jQuery'],
    factory: function (mod1, mod2, $) {
        "use strict";
        
        console.log('module1 loaded:', mod1.isModule1);
        console.log('module2 loaded:', mod2.isModule2);
        console.log('jQuery loaded:', typeof $ === 'function');

        return {
            module1: mod1,
            module2: mod2
        };
    }
});
