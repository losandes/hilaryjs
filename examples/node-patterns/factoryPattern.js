/*jslint node: true*/

/*
// The Factory pattern with Hilary is probably the most straight forward. It results in more
// data being put into Hilary's memory footprint than with the Factory Initializer pattern,
// which may or may not make a difference depending on how large your module is.
//
// Note that this pattern does not control whether or not your dependencies are loaded
// at startup, or if they are lazy loaded. That depends solely on how you bootstrap you application.
*/

module.exports.name = 'factoryPattern';
module.exports.dependencies = ['mockModule1', 'mockModule2', 'processHelper', 'backToTheBeginning'];
module.exports.factory = function (echoHandler, salutations, processHelper, backToTheBeginning) {
    "use strict";
    
    var ignore = true,
        init;
    
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
     
    init = function () {
        //process.stdin.resume();
        console.log('');
        console.log('Please tell me your name');
        ignore = false;
    };
    
    return {
        init: init
    };
};
