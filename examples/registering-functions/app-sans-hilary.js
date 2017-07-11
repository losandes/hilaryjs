'use strict';

var listener = require('./q-and-a/listener.js'),
    printer = require('./q-and-a/printer.js'),
    Question = require('./q-and-a/question.js'),
    questions = require('./questions.js');

var question = new Question.factory(printer.factory, listener.factory),
    selected = questions[Math.floor(Math.random() * questions.length)];

question.ask(selected.q, selected.a);
