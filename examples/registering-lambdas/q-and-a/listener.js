module.exports.name = 'listener';
module.exports.dependencies = false;
module.exports.factory = (answer) => {
    'use strict';

    return {
        listen: listen
    };

    function listen () {
        process.stdin.once('data', function (data) {
            test(data.toString().trim());
        });
    }

    function test (input) {
        if (input === answer) {
            console.log('Correct!');
            process.exit(0);
        } else {
            console.log('Sorry, try again!');
            listen();
        }
    }
};
