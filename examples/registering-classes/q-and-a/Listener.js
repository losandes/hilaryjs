module.exports.name = 'Listener';
module.exports.dependencies = false;
module.exports.factory = class {

    constructor (answer) {
        this.answer = answer;
    }

    listen () {
        var self = this;

        process.stdin.once('data', function (data) {
            self.test(data.toString().trim(), self.answer);
        });
    }

    test (input, answer) {
        if (input === answer) {
            console.log('Correct!');
            process.exit(0);
        } else {
            console.log('Sorry, try again!');
            this.listen();
        }
    }

};
