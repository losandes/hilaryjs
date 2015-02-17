/*jslint node: true*/
var Hilary = require('../../index.js'), //require('hilary'),
    compose,
    start,
    container = new Hilary();

compose = function (container) {
    "use strict";
    
    var express = require('express'),
        expressSingleton = express(),
        router = express.Router();
    
    container.register('express', express);                         // lib
    container.register('expressSingleton', expressSingleton);       // single instance used for app
    container.register('router', router);                           // route engine
    container.register('favicon', require('serve-favicon'));
    container.register('logger', require('morgan'));
    container.register('cookieParser', require('cookie-parser'));
    container.register('bodyParser', require('body-parser'));
    container.register('less', require('less-middleware'));
    container.register('serve-static', require('serve-static'));
    container.register('debug', function () {
        return require('debug')('expressdefault:server');
    });
    
    // the following registrations will fallback to Node's require if they are commented out
    //container.register('http', require('http'));
    //container.register('path', require('path'));
    
    
    container.autoRegister(require('./expressApp.js'));             // configures middleware and controllers
    container.autoRegister(require('./www.js'));                    // the HTTP server
    
    container.register('controllerFactory', function (expressApp, next) {
        container.autoRegister(require('./controllers/'));              // the controllers
        expressApp.use(container.resolve('router'));

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
    compose(container);
    console.log('startup::starting server');
    container.resolve('www');
//    var app = container.resolve('expressApp');
//    container.resolve('www').start(app);
};

start();
