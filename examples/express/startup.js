/*jslint node: true*/

// All app variables are defined in start and compose.
// By isolating the app's requirements into the start and compose functions,
// The entire app can be restarted from within, to react to failure, and to
// get into a clean running state when associated services recover from failure.
var compose,
    start;

compose = function (scope) {
    "use strict";
    
    var express = require('express'),
        expressSingleton = express(),
        router = express.Router(),
        favicon = require('serve-favicon'),
        logger = require('morgan'),
        cookieParser = require('cookie-parser'),
        bodyParser = require('body-parser'),
        less = require('less-middleware'),
        debug = require('debug')('expressdefault:server');
    
    /*
    // we'll use the AMD define syntax to wire up the node dependencies, for simplicity.
    // Note that we're creating parameterless factories that return the result of
    // node's require function, instead of just registering the modules themselves.
    // This approach reduces memory overhead in Hilary, and allows node to behave as it
    // normally would when using the service-location anti-pattern (i.e. node will to do it's
    // own caching and GC, as normal)
    */
    scope.define('express',             function () { return express; });          // lib
    scope.define('expressSingleton',    function () { return expressSingleton; }); // single instance used for app
    scope.define('router',              function () { return router; });           // route engine
    scope.define('favicon',             function () { return favicon; });
    scope.define('logger',              function () { return logger; });
    scope.define('cookieParser',        function () { return cookieParser; });
    scope.define('bodyParser',          function () { return bodyParser; });
    scope.define('less',                function () { return less; });
    scope.define('debug',               function () { return debug; });
    
    /*
    // Alternatively, you can let Hilary gracefully degrade to node's require function.
    // If you don't define a dependency, and the name is resolvable via node's require function,
    // the result of that require function will be returned.
    //
    // The commented out definitions below serve as an example in this project
    */
    //scope.define('http', function () { return require('http'); });
    //scope.define('path', function () { return require('path'); });
    //scope.define('serve-static',        function () { return require('serve-static'); });
    
    
    scope.register(require('./expressApp.js'));             // configures middleware and controllers
    scope.register(require('./www.js'));                    // the HTTP server
    scope.register({
        name: 'controllerFactory',
        factory: function (expressApp, next) {
            scope.autoResolve(require('./controllers/'));   // execute the controller modules to register routes
            expressApp.use(scope.resolve('router'));        // use the router, after the controllers are all registered

            if (typeof next === 'function') {
                next();                                     // execute the "after" middleware
            }
        }
    });
};


// start
start = function () {
    "use strict";
    var Hilary = require('hilary'),
        scope = Hilary.scope('express-example').useAMD();
    
    console.log('startup::@' + new Date().toISOString());
    console.log('startup::composing application');
    
    // compose the application dependency graph
    compose(scope);
    
    console.log('startup::starting server');
    
    // start the app
    scope.resolve('www');
};

start();
