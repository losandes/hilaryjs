/*jslint node: true*/
module.exports.name = 'mockModule2';
module.exports.factory = function () {
    "use strict";
    
    var makeSalutation = function (name) {
        return 'Greetings, ' + name + '!';
    };
    
    return {
        makeSalutation: makeSalutation
    };
};
