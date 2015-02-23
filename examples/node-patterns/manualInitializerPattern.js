/*jslint node: true, nomen: true*/

/*
// The benefit of the Manual Initializer pattern is that very little data is put into
// Hilary's memory footprint, and the module asserts more control over how dependencies are established.
// You write your module as you would any other module, and make this module available in Hilary so other
// modules can depend on it. You manually inject your dependencies when you application starts up.
// A drawback of this pattern is that you spread your dependency expectations and dependency injection
// execution across two files, so it can be harder to make sure they have the same number and
// same order of arguments.
//
// Note that, while this pattern does not control whether or not your dependencies are loaded
// at startup, it expects the onLoad function to be called on application startup.
*/

"use strict";

var ignore = true,
    onLoad,
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

onLoad = function (_echoHandler, _salutations, _processHelper, _backToTheBeginning) {
    echoHandler = _echoHandler;
    salutations = _salutations;
    processHelper = _processHelper;
    backToTheBeginning = _backToTheBeginning;
};

init = function () {
    console.log('');
    console.log('Please tell me your name');
    ignore = false;
};

module.exports.name = 'manualInitializerPattern';
module.exports.factory = function () {
    return {
        onLoad: onLoad,
        init: init
    };
};
