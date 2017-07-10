module.exports.name = 'Question';
module.exports.dependencies = ['printer', 'Listener'];
module.exports.factory = function (printer, Listener) {
    'use strict';

    return function (question, answer) {
        return {
            ask: function () {
                printer.print(question);
                new Listener(answer).listen();
            }
        };
    };
};
