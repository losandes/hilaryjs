/* globals document */
module.exports = {
    scope: 'myApp',
    name: 'viewModel',
    dependencies: ['bot'],
    factory: function (bot) {
        'use strict';

        document.getElementById('submit').addEventListener('click', function() {
            bot.sayHello(document.getElementById('name').value);
        }, false);
    }
};
