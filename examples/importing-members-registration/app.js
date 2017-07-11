var scope = require('../../index.js').scope('members'); //require('hilary').scope('members');

// Starting with a module that returns the numbers 1-3 in english
scope.register({
    name: 'english',
    factory: {
        one: 'one',
        two: 'two',
        three: 'three'
    }
});

// We can depend only on the members of that module, that we need
scope.register({
    name: 'oneAndTwo',
    dependencies: [
        'assert',
        'english { one, two }'
    ],
    factory: function (assert, reduced) {
        'use strict';

        assert.equal(reduced.one, 'one');
        assert.equal(reduced.two, 'two');
        assert.equal(typeof reduced.three, 'undefined');

        return reduced;
    }
});

// We can alias the members, naming them as we want
scope.register({
    name: 'spanishToEnglish',
    dependencies: [
        'assert',
        'english { one as uno, two as dos, three as tres }'
    ],
    factory: function (assert, spanish) {
        'use strict';

        assert.equal(spanish.uno, 'one');
        assert.equal(spanish.dos, 'two');
        assert.equal(spanish.tres, 'three');

        return spanish;
    }
});

// We can remove the parent object, by importing a single member
scope.register({
    name: 'spanishToEnglish2',
    dependencies: [
        'assert',
        'english { one }',
        'english { two }',
        'english { three }'
    ],
    factory: function (assert, uno, dos, tres) {
        'use strict';

        assert.equal(uno, 'one');
        assert.equal(dos, 'two');
        assert.equal(tres, 'three');

        return [uno, dos, tres];
    }
});

console.log(scope.resolve('oneAndTwo'));
console.log(scope.resolve('spanishToEnglish'));
console.log(scope.resolve('spanishToEnglish2'));
