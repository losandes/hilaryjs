'use strict';

module.exports.name = 'listener';
module.exports.factory = {
    listen: listen
};

function listen (answer) {
    process.stdin.once('data', function (data) {
        test(data.toString().trim(), answer);
    });
}

function test (input, answer) {
    if (input === answer) {
        console.log('Correct!');
        process.exit(0);
    } else {
        console.log('Sorry, try again!');
        listen(answer);
    }
}
