module.exports = {
    scope: 'myApp',
    name: 'consoleNotifier',
    factory: function () {
        'use strict';

        return {
            notify: function (message) {
                console.log(message);
            }
        };
    }
};
