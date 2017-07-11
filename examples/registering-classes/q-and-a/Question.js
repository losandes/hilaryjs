module.exports.name = 'Question';
module.exports.dependencies = ['printer', 'Listener'];
module.exports.factory = class {

    constructor(printer, Listener) {
        this.printer = printer;
        this.Listener = Listener;
    }

    ask (question, answer) {
        this.printer.print(question);
        new this.Listener(answer).listen();
    }

};
