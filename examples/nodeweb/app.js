/*jslint node: true*/
var Hilary = require('../../index.js'), //require('hilary'),
    compose,
    start,
    scope = new Hilary().useAMD();

compose = function (scope) {
    "use strict";
    
    var express = require('express'),
        expressSingleton = express(),
        router = express.Router();
    
    scope.define('express', express);                         // lib
    scope.define('expressSingleton', expressSingleton);       // single instance used for app
    scope.define('router', router);                           // route engine
    scope.define('favicon', require('serve-favicon'));
    scope.define('logger', require('morgan'));
    scope.define('cookieParser', require('cookie-parser'));
    scope.define('bodyParser', require('body-parser'));
    scope.define('less', require('less-middleware'));
    scope.define('serve-static', require('serve-static'));
    scope.define('debug', function () {
        return require('debug')('expressdefault:server');
    });
    
    // the following registrations will fallback to Node's require if they are commented out
    //scope.define('http', require('http'));
    //scope.define('path', require('path'));
    
    
    scope.autoRegister(require('./expressApp.js'));             // configures middleware and controllers
    scope.autoRegister(require('./www.js'));                    // the HTTP server
    
    scope.define('controllerFactory', function (expressApp, next) {
        scope.autoResolve(require('./controllers/'));              // the controllers
        expressApp.use(scope.resolve('router'));

        if (typeof next === 'function') {
            next();
        }
    });
};


// start
start = function () {
    "use strict";
    console.log('startup::@' + new Date().toISOString());
    console.log('startup::composing application');
    compose(scope);
    console.log('startup::starting server');
    scope.resolve('www');
//    var app = scope.resolve('expressApp');
//    scope.resolve('www').start(app);
};

start();
