module.exports = {
    scope: 'myApp',
    name: 'consoleNotifier',
    factory: function () {
        'use strict';

        return {
            notify: message => {
                console.log(message);
            }
        };
    }
};
