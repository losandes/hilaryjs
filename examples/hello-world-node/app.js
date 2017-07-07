'use strict';

var hilary = require('../../index.js'), //require('hilary');
    http = require('./http.js'),
    api = require('./api.js');

hilary.scope('myApp', {
    log: {
        level: 'trace'
    }
}).bootstrap([
    function (scope, next) {
        console.log('registering modules');

        // note: you can also register indexes (arrays of modules)
        scope.register(http);
        scope.register(api);

        next(null, scope);
    }
], function (err, scope) {
    if (err) {
        throw err;
    }

    console.log('starting api');
    // In this example, resolving `api` starts our app
    scope.resolve('api');
});
