module.exports.name = 'listener';
module.exports.dependencies = false;
module.exports.factory = (answer) => {
    'use strict';

    return {
        listen: listen
    };

    function listen () {
        process.stdin.once('data', function (data) {
            if (test(data.toString().trim())) {
                console.log('Correct!');
                process.exit(0);
            } else {
                console.log('Sorry, try again!');
                listen();
            }
        });
    }

    function test (input) {
        return input === answer;
    }
};
