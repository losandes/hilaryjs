/*jslint node: true, nomen: true*/

/*
// The benefit of the Factory Initializer pattern is that very little data is put into
// Hilary's memory footprint. You write your module as you would any other module, and
// just take advantage of Hilary for dependency injection.
//
// Note that this pattern does not control whether or not your dependencies are loaded
// at startup, or if they are lazy loaded. That depends solely on how you bootstrap you application.
*/

"use strict";

var ignore = true,
    init,
    echoHandler,
    salutations,
    processHelper,
    backToTheBeginning;

process.stdin.on('data', function (text) {
    if (!ignore) {
        var scrubbed = processHelper.scrubInput(text);
        echoHandler.echo(salutations.makeSalutation(scrubbed));

        //processHelper.done();

        if (text === 'quit\n') {
            processHelper.done();
        } else {
            ignore = true;
            backToTheBeginning();
        }
    }
});

init = function (_echoHandler, _salutations, _processHelper, _backToTheBeginning) {
    echoHandler = _echoHandler;
    salutations = _salutations;
    processHelper = _processHelper;
    backToTheBeginning = _backToTheBeginning;
    
    console.log('');
    console.log('Please tell me your name');
    ignore = false;
};

module.exports.name = 'factoryInitializerPattern';
module.exports.dependencies = ['mockModule1', 'mockModule2', 'processHelper', 'backToTheBeginning'];
module.exports.factory = function (echoHandler, salutations, processHelper, backToTheBeginning) {
    return {
        init: function () {
            return init(echoHandler, salutations, processHelper, backToTheBeginning);
        }
    };
};
