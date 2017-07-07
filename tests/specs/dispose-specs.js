(function (register) {
    'use strict';

    register({
        name: 'dispose-specs',
        Spec: Spec
    });

    function Spec (hilary, expect, id) {
        return {
            'when dispose is given a single module name,': {
                'it should dispose only that module': disposeByName,
                'it should return false, if no module is found': disposeByNameNotFound
            },
            'when dispose is given an array of module names,': {
                'it should dispose each of those modules': disposeMany,
                'it should return a result of false, with an array of missing modules, if any module is NOT found': disposeManyNotFound
            },
            'when dispose is given no arguments,': {
                'it should dispose all modules': disposeAll
            }
        };

        function disposeByName () {
            // given
            var sut = hilary.scope(id.createUid(8), { logging: { level: 'off' } }),
                actual;
            sut.register({name: 'test1', factory: { foo: 'bar' }});
            sut.register({name: 'test2', factory: { foo: 'bar' }});

            expect(sut.resolve('test1').foo).to.equal('bar');
            expect(sut.resolve('test2').foo).to.equal('bar');

            // when
            actual = sut.dispose('test1');

            // then
            expect(actual).to.equal(true);
            expect(sut.resolve('test1').isException).to.equal(true);
            expect(sut.resolve('test2').foo).to.equal('bar');
        }

        function disposeByNameNotFound () {
            // given
            var sut = hilary.scope(id.createUid(8), { logging: { level: 'off' } }),
                actual;

            // when
            actual = sut.dispose('test');

            // then
            expect(actual).to.equal(false);
        }

        function disposeMany () {
            // given
            var sut = hilary.scope(id.createUid(8), { logging: { level: 'off' } }),
                actual;
            sut.register({name: 'test1', factory: { foo: 'bar' }});
            sut.register({name: 'test2', factory: { foo: 'bar' }});
            sut.resolve('test2'); // will move test2 from container to singletonContainer

            // when
            actual = sut.dispose(['test1', 'test2']);

            // then
            expect(actual.result).to.equal(true);
            expect(actual.disposed.length).to.equal(2);
            expect(sut.resolve('test1').isException).to.equal(true);
            expect(sut.resolve('test2').isException).to.equal(true);
        }

        function disposeManyNotFound () {
            // given
            var sut = hilary.scope(id.createUid(8), { logging: { level: 'off' } }),
                actual;
            sut.register({name: 'test1', factory: { foo: 'bar' }});

            // when
            actual = sut.dispose(['test1', 'test2']);

            // then
            expect(actual.result).to.equal(false);
            expect(actual.disposed.indexOf('test2')).to.equal(-1);
        }

        function disposeAll () {
            // given
            var sut = hilary.scope(id.createUid(8), { logging: { level: 'off' } }),
                actual;
            sut.register({name: 'test1', factory: { foo: 'bar' }});
            sut.register({name: 'test2', factory: { foo: 'bar' }});

            // when
            actual = sut.dispose();

            // then
            expect(actual).to.equal(true);
            expect(sut.resolve('test1').isException).to.equal(true);
            expect(sut.resolve('test2').isException).to.equal(true);
        }

    } // /Spec

}(function (registration) {
    'use strict';

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = registration.Spec;
    } else if (typeof window !== 'undefined') {
        window.fixtures = window.fixtures || {};
        window.fixtures[registration.name] = registration.Spec;
    } else {
        throw new Error('[HILARY-TESTS] Unkown runtime environment');
    }
}));
