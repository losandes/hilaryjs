/* globals hilary */
(function (scope) {
    'use strict';

    scope.bootstrap([
        function (scope, next) {
            scope.register({
                name: 'notifier',
                factory: scope.resolve('alertNotifier')
            });

            next(null, scope);
        }
    ], function (err, scope) {
        if (err) {
            throw err;
        }

        scope.resolve('viewModel');
        console.log('ready');
    });

} (hilary.scope('myApp')));
