(function (register) {
    'use strict';

    register({
        name: 'Container-specs',
        Spec: Spec
    });

    function Spec (hilary, expect) {
        return {
            'Container.get': {
                'should return the underlying repository': get
            },
            'Container.register': {
                'should add a module, by name': register
            },
            'Container.resolve': {
                'should return a module, by name': resolve,
                'should return undefined, if no module is found': resolveNotFound
            },
            'Container.exists': {
                'should return true, if a module exists, by name': exists,
                'should return false, if a module does NOT exist, by name': existsNotFound
            },
            'Container.enumerate': {
                'should enumerate each module, executing the consumer function': enumerate,
                'should return an Exception, if the consumer is not a function': enumerateInvalidArg
            },
            'Container.dispose,': {
                'when given a single module name,': {
                    'it should dispose only that module': disposeByName,
                    'it should return false, if no module is found': disposeByNameNotFound
                },
                'when given an array of module names,': {
                    'it should dispose each of those modules': disposeMany,
                    'it should return a result of false, with an array of missing modules, if any module is NOT found': disposeManyNotFound
                },
                'when given no arguments,': {
                    'it should dispose all modules': disposeAll
                }
            },
            'Container.disposeOne': {
                'should dispose only that module': disposeOne,
                'should return false, if no module is found': disposeOneNotFound
            }
        };

        function get () {
            // given
            var sut = new Container(),
                actual;

            sut.register({name: 'test', factory: { foo: 'bar' }});

            // when
            actual = sut.get();

            // then
            expect(actual.test.factory.foo).to.equal('bar');
        }

        function register () {
            // given
            var sut = new Container(),
                actual;

            // when
            sut.register({name: 'test', factory: { foo: 'bar' }});
            actual = sut.get();

            // then
            expect(actual.test.factory.foo).to.equal('bar');
        }

        function resolve () {
            // given
            var sut = new Container(),
                actual;

            sut.register({name: 'test', factory: { foo: 'bar' }});

            // when
            actual = sut.resolve('test');

            // then
            expect(actual.factory.foo).to.equal('bar');
        }

        function resolveNotFound () {
            // given
            var sut = new Container(),
                actual;

            // when
            actual = sut.resolve('test');

            // then
            expect(actual).to.equal(undefined);
        }

        function exists () {
            // given
            var sut = new Container(),
                actual;

            sut.register({name: 'test', factory: { foo: 'bar' }});

            // when
            actual = sut.exists('test');

            // then
            expect(actual).to.equal(true);
        }

        function existsNotFound () {
            // given
            var sut = new Container(),
                actual;

            // when
            actual = sut.exists('test');

            // then
            expect(actual).to.equal(false);
        }

        function enumerate (done) {
            // given
            var sut = new Container();
            sut.register({name: 'test', factory: { foo: 'bar' }});

            // when
            sut.enumerate(function (propertyName, actual) {
                expect(propertyName).to.equal('test');
                expect(actual.factory.foo).to.equal('bar');
                done();
            });
        }

        function enumerateInvalidArg () {
            // given
            var sut = new Container(),
                actual;
            sut.register({name: 'test', factory: { foo: 'bar' }});

            // when
            actual = sut.enumerate();

            // then
            expect(actual.isException).to.equal(true);
        }

        function disposeByName () {
            // given
            var sut = new Container(),
                actual;
            sut.register({name: 'test1', factory: { foo: 'bar' }});
            sut.register({name: 'test2', factory: { foo: 'bar' }});

            expect(sut.resolve('test1').name).to.equal('test1');
            expect(sut.resolve('test2').name).to.equal('test2');

            // when
            actual = sut.dispose('test1');

            // then
            expect(actual).to.equal(true);
            expect(sut.resolve('test1')).to.equal(undefined);
            expect(sut.resolve('test2').name).to.equal('test2');
        }

        function disposeByNameNotFound () {
            // given
            var sut = new Container(),
                actual;

            // when
            actual = sut.dispose('test');

            // then
            expect(actual).to.equal(false);
        }

        function disposeMany () {
            // given
            var sut = new Container(),
                actual;
            sut.register({name: 'test1', factory: { foo: 'bar' }});
            sut.register({name: 'test2', factory: { foo: 'bar' }});

            // when
            actual = sut.dispose(['test1', 'test2']);

            // then
            expect(actual.result).to.equal(true);
            expect(actual.disposed.length).to.equal(2);
            expect(sut.resolve('test1')).to.equal(undefined);
            expect(sut.resolve('test2')).to.equal(undefined);
        }

        function disposeManyNotFound () {
            // given
            var sut = new Container(),
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
            var sut = new Container(),
                actual;
            sut.register({name: 'test1', factory: { foo: 'bar' }});
            sut.register({name: 'test2', factory: { foo: 'bar' }});

            // when
            actual = sut.dispose();

            // then
            expect(actual).to.equal(true);
            expect(sut.resolve('test1')).to.equal(undefined);
            expect(sut.resolve('test2')).to.equal(undefined);
        }

        function disposeOne () {
            // given
            var sut = new Container(),
                actual;
            sut.register({name: 'test', factory: { foo: 'bar' }});

            // when
            actual = sut.disposeOne('test');

            // then
            expect(actual).to.equal(true);
            expect(sut.resolve('test')).to.equal(undefined);
        }

        function disposeOneNotFound () {
            // given
            var sut = new Container(),
                actual;

            // when
            actual = sut.disposeOne('test');

            // then
            expect(actual).to.equal(false);
        }

        function Container () {
            // this might seem odd, but each new scope has new containers,
            // so this is an around-about way to construct new containers
            return hilary.scope().context.container;
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
