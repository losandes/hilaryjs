/*jslint node: true*/
module.exports.name = 'processStartup';
module.exports.dependencies = ['factoryPattern', 'factoryInitializerPattern', 'manualInitializerPattern', 'processHelper'];
module.exports.factory = function (factory, factoryInitializer, manualInitializer, processHelper) {
    "use strict";

    var ignore = false,
        init;
    
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (text) {
        if (!ignore) {
            var scrubbed = processHelper.scrubInput(text);
            ignore = true;

            switch (scrubbed) {
            case 'factory':
                factory.init();
                break;
            case 'factoryInitializer':
                factoryInitializer.init();
                break;
            case 'manualInitializer':
                manualInitializer.init();
                break;
            case 'quit':
                processHelper.done();
                break;
            default:
                console.log('Sorry, I didn\'t recognize that');
                init();
                break;
            }
        }
    });
    
    init = function () {
        console.log('');
        console.log('Please tell me which pattern you want to explore');
        process.nextTick(function () { ignore = false; });
    };
    
    return {
        init: init
    };

};
