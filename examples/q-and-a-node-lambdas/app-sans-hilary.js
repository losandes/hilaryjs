'use strict';

var listener = require('./q-and-a/listener.js'),
    printer = require('./q-and-a/printer.js'),
    questionFactory = require('./q-and-a/question.js'),
    questions = require('./questions.js');

var question = questionFactory.factory(printer.factory, listener.factory),
    selected = questions[Math.floor(Math.random() * questions.length)];

question(selected.q, selected.a).ask();
