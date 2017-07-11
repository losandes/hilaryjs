(function (register) {
    'use strict';

    register({
        name: 'HilaryModule-specs',
        Spec: Spec
    });

    function Spec (HilaryModule, expect) {
        return {
            'HilaryModule.name': {
                'is required': nameRequired,
                'must be a string': nameMustBeString
            },
            'HilaryModule.singleton': {
                'is NOT required': singletonNotRequired,
                'is true, by default': singletonDefaultTrue,
                'can be set to false': singletonSetFalse
            },
            'HilaryModule.dependencies': {
                'is NOT required': dependenciesNotRequired,
                'must be an array or FALSE': dependenciesMustBeArrayOrFalse,
                'are generated if undefined, and factory takes arguments':
                    dependenciesAreGeneratedIfUndefinedAndFactoryTakesArgs
            },
            'HilaryModule.factory': {
                'is required': factoryIsRequired,
                'can be an object': factoryCanBeObject,
                'can be a primitive': factoryCanBePrimitive,
                'can be a function': factoryCanBeFunction,
                'can be an es6 class': factoryCanBeEs6Class,
                'must have a function or class factory, if dependencies are defined':
                    factoryMustHaveFactoryIfDependenciesAreDefined,
                'must have equal number of dependencies and factory args (deps.length > args.length)':
                    factoryMustHaveEvenDependenciesAndFactoryArgs1,
                'must have equal number of dependencies and factory args (deps.length < args.length)':
                    factoryMustHaveEvenDependenciesAndFactoryArgs2
            },
        };

        function nameRequired () {
            var expected = 'It should have the property, name, with type, string',
                actual = new HilaryModule({
                    factory: function () {}
                });

            expect(actual.isException).to.equal(true);
            expect(actual.messages[0].indexOf(expected) > -1).to.equal(true);
        }

        function nameMustBeString () {
            var expected = 'It should have the property, name, with type, string',
                actual = new HilaryModule({
                    name: 42,
                    factory: function () {}
                });

            expect(actual.isException).to.equal(true);
            expect(actual.messages[0].indexOf(expected) > -1).to.equal(true);
        }

        function singletonNotRequired () {
            var actual = new HilaryModule({
                name: 'blah',
                factory: function () {}
            });

            expect(actual.isException).to.equal(undefined);
        }

        function singletonDefaultTrue () {
            var actual = new HilaryModule({
                name: 'blah',
                singleton: 42,
                factory: function () {}
            });

            expect(actual.singleton).to.equal(true);
        }

        function singletonSetFalse () {
            var actual = new HilaryModule({
                name: 'blah',
                singleton: false,
                factory: function () {}
            });

            expect(actual.singleton).to.equal(false);
        }

        function dependenciesNotRequired () {
            var actual = new HilaryModule({
                name: 'blah',
                factory: function () {}
            });

            expect(actual.isException).to.equal(undefined);
        }

        function dependenciesMustBeArrayOrFalse () {
            var expected = 'It should have the property, dependencies, with type, array',
                actual = new HilaryModule({
                    name: 'blah',
                    dependencies: 42,
                    factory: function () {}
                });

            expect(actual.isException).to.equal(true);
            expect(actual.messages[0].indexOf(expected) > -1).to.equal(true);
        }

        function dependenciesAreGeneratedIfUndefinedAndFactoryTakesArgs () {
            var actual = new HilaryModule({
                name: 'blah',
                // jshint -W098
                factory: function (foo, bar, baz) {}
                // jshint +W098
            });

            expect(actual.isException).to.equal(undefined);
            expect(actual.dependencies[0]).to.equal('foo');
            expect(actual.dependencies[1]).to.equal('bar');
            expect(actual.dependencies[2]).to.equal('baz');
        }

        function factoryIsRequired () {
            var expected = 'It should have the property, factory',
                actual = new HilaryModule({
                    name: 'blah'
                });

            expect(actual.isException).to.equal(true);
            expect(actual.messages[0].indexOf(expected) > -1).to.equal(true);
        }

        function factoryCanBeObject () {
            var actual = new HilaryModule({
                name: 'blah',
                factory: { foo: 'bar' }
            });

            expect(actual.isException).to.equal(undefined);
            expect(actual.factory.foo).to.equal('bar');
        }

        function factoryCanBePrimitive () {
            var actual = new HilaryModule({
                name: 'blah',
                factory: 42
            });

            expect(actual.isException).to.equal(undefined);
            expect(actual.factory).to.equal(42);
        }

        function factoryCanBeFunction () {
            var actual = new HilaryModule({
                name: 'blah',
                factory: function () { return 42; }
            });

            expect(actual.isException).to.equal(undefined);
            expect(actual.factory()).to.equal(42);
        }

        function factoryCanBeEs6Class () {
            var actual = new HilaryModule({
                name: 'blah',
                factory: class {
                    constructor () {
                        this.answer = 42;
                    }
                }
            });

            expect(actual.isException).to.equal(undefined);
            expect(new actual.factory().answer).to.equal(42);
        }

        function factoryMustHaveFactoryIfDependenciesAreDefined () {
            var expected = 'Dependencies were declared, but the factory is not a function, so they cannot be applied.',
                actual = new HilaryModule({
                    name: 'blah',
                    dependencies: ['foo'],
                    factory: {}
                });

            expect(actual.isException).to.equal(true);
            expect(actual.messages[0].indexOf(expected) > -1).to.equal(true);
        }

        function factoryMustHaveEvenDependenciesAndFactoryArgs1 () {
            var expected = 'The number of dependencies that were declared does not match the number of arguments that the factory accepts.',
                actual = new HilaryModule({
                    name: 'blah',
                    dependencies: ['foo', 'bar'],
                    // jshint -W098
                    factory: function (foo) {}
                    // jshint +W098
                });

            expect(actual.isException).to.equal(true);
            expect(actual.messages[0].indexOf(expected) > -1).to.equal(true);
        }

        function factoryMustHaveEvenDependenciesAndFactoryArgs2 () {
            var expected = 'The number of dependencies that were declared does not match the number of arguments that the factory accepts.',
                actual = new HilaryModule({
                    name: 'blah',
                    dependencies: ['foo'],
                    // jshint -W098
                    factory: function (foo, bar) {}
                    // jshint +W098
                });

            expect(actual.isException).to.equal(true);
            expect(actual.messages[0].indexOf(expected) > -1).to.equal(true);
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
