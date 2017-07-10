module.exports.name = 'question';
module.exports.dependencies = ['printer', 'listener'];
module.exports.factory = (printer, listener) => {
    'use strict';

    return function (question, answer) {
        return {
            ask: function () {
                printer.print(question);
                listener(answer).listen();
            }
        };
    };
};
