'use strict';

var hilary = require('../../index.js'), //require('hilary');
    scope = hilary.scope('myApp'),
    qAndA = require('./q-and-a'),
    questions = require('./questions.js');

scope.bootstrap([
    scope.makeRegistrationTask(qAndA)
], function (err, scope) {
    if (err) {
        throw err;
    }

    var question = scope.resolve('Question'),
        selected = questions[Math.floor(Math.random() * questions.length)];

    question.ask(selected.q, selected.a);
});
