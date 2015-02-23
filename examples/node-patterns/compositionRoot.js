/*jslint node: true*/

// All app variables are defined in start and compose.
// By isolating the app's requirements into the start and compose functions,
// The entire app can be restarted from within, to react to failure, and to
// get into a clean running state when associated services recover from failure.
var compose,
    start;

compose = function (scope) {
    "use strict";
    
    var processStartup;
    
    // Auto-register the supportingModules Index
    scope.autoRegister(require('./supportingModules'));
    
    // Register ad-hoc modules
    scope.register(require('./factoryPattern.js'));
    scope.register(require('./factoryInitializerPattern.js'));
    scope.register(require('./manualInitializerPattern.js'));
    
    // Abstract a circular dependency away from the dependency graph by composing a factory here.
    // Notice that this registration does not define dependencies. The stopExecution argument is
    // there just to instruct Hilary not to execute the factory (it doesn't have to be named stopExecution).
    scope.register({
        name: 'backToTheBeginning',
        factory: function (stopExecution) {
            return processStartup.init();
        }
    });
    
    // Manually inject dependencies into the manualInitializerPattern module.
    scope.resolve('manualInitializerPattern').onLoad(
        scope.resolve('mockModule1'),
        scope.resolve('mockModule2'),
        scope.resolve('processHelper'),
        scope.resolve('backToTheBeginning')
    );
    
    // Set the processStartup variable to the output of processStartup, so it can be used by
    // the backToBeginning module.
    processStartup = scope.resolve('processStartup');
    
    // The start function will init processStartup, so return the value to support this
    return processStartup;
};

start = function () {
    "use strict";
    
    // create a scope for our application
    var Hilary = require('hilary'),
        scope = new Hilary(),
        processStartup;
    
    // compose the object graph
    processStartup = compose(scope);
    
    // start the application
    processStartup.init();
};

start();
