module.exports = {
    scope: 'myApp',
    name: 'bot',
    dependencies: ['notifier'],
    factory: function (notifier) {
        'use strict';

        return {
            sayHello: function (name) {
                notifier.notify('Hello, ' + name);
            }
        };
    }
};
