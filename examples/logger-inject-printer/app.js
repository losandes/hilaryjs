'use strict';

var hilary = require('../../index.js'), //require('hilary');
    scope = hilary.scope('myApp', {
        logging: {
            level: 'trace',
            printer: function (entry) {
                console.log('MY PRINTER', entry);
            }
        }
    });

scope.register({
    name: 'foo',
    factory: 42
});
