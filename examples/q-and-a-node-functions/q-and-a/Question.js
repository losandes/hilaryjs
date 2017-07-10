module.exports.name = 'question';
module.exports.dependencies = ['printer', 'listener'];
module.exports.factory = function (printer, listener) {
    'use strict';

    return {
        ask: function (question, answer) {
            printer.print(question);
            listener.listen(answer);
        }
    };
};
