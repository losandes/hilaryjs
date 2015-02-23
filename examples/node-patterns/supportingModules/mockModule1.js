/*jslint node: true*/
module.exports.name = 'mockModule1';
module.exports.factory = function () {
    "use strict";
    
    var echo = function (message) {
        console.log('');
        console.log(message);
        console.log('');
    };
    
    return {
        echo: echo
    };
};
