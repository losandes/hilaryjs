var assert = require('assert'),
    scope = require('../../index.js').scope('members'); //require('hilary').scope('members');

// Starting with a module that returns the numbers 1-3 in english
scope.register({
    name: 'english',
    factory: {
        one: 'one',
        two: 'two',
        three: 'three'
    }
});

// We can reduce an object to only the members that we want
var oneAndTwo = scope.resolve('english { one, two }');
console.log(oneAndTwo);
assert.equal(oneAndTwo.one, 'one');
assert.equal(oneAndTwo.two, 'two');
assert.equal(typeof oneAndTwo.three, 'undefined');

// We can alias the members, naming them as we want
var spanishToEnglish = scope.resolve('english { one as uno, two as dos, three as tres }');
console.log(spanishToEnglish);
assert.equal(spanishToEnglish.uno, 'one');
assert.equal(spanishToEnglish.dos, 'two');
assert.equal(spanishToEnglish.tres, 'three');

// We can remove the parent object, by importing a single member
var uno = scope.resolve('english { one }');
var dos = scope.resolve('english { two }');
var tres = scope.resolve('english { three }');
console.log([ uno, dos, tres ]);
assert.equal(uno, 'one');
assert.equal(dos, 'two');
assert.equal(tres, 'three');
