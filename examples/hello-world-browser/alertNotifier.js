/* globals alert */
module.exports = {
    scope: 'myApp',
    name: 'alertNotifier',
    factory: function () {
        'use strict';

        return {
            notify: message => {
                alert(message);
            }
        };
    }
};
