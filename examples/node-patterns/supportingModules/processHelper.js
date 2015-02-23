/*jslint node: true*/
module.exports.name = 'processHelper';
module.exports.dependencies = ['util']
module.exports.factory = function (util) {
    "use strict";
    
    var done,
        scrubInput;
    
    scrubInput = function (text) {
        return util.inspect(text).replace(/\\n|\'/gm, ''); ////(/(\r\n|\n|\r)/gm, "");
    };
    
    done = function () {
        console.log('');
        console.log('Thanks for visiting.');
        console.log('');
        process.exit();
    };
    
    return {
        scrubInput: scrubInput,
        done: done
    };
};
