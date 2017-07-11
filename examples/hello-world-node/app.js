'use strict';

var hilary = require('../../index.js'), //require('hilary'),
    scope = hilary.scope('myApp', {
        log: {
            level: 'trace'
        }
    });

scope.bootstrap([
    scope.makeRegistrationTask(require('./http.js')),
    scope.makeRegistrationTask(require('./api.js'))
], function (err, scope) {
    if (err) {
        console.log(err);
        return;
    }

    console.log('starting api');
    // In this example, resolving `api` starts our app
    scope.resolve('api');
});
