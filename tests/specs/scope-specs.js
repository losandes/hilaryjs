(function (register) {
    'use strict';

    register({
        name: 'scope-specs',
        Spec: Spec
    });

    function Spec (hilary, expect, id) {
        return {
            'when a new scope is created,': {
                'it should use the given name': namedScope,
                'it should generate a name for the scope, if name arg is falsey': generatesName,
                'it should support overriding the logger': scopeWithLogger,
                'it should support overriding the log level': scopeWithLogLevel,
                'it should support overriding the log printer': scopeWithLogPrinter,
                'it should use the current scope as the parent, by default, if the current scope is NOT "default"': defaultParentScope,
                'it should use options.parent (string) as the parent, if set': optionalParentScopeString,
                'it should use options.parent (scope) as the parent, if set': optionalParentScopeScope,
                'and the parent is set, but does NOT exist,': {
                    'it should still set the parent to support out-of-order definitions': optionalParentScopeStringNotFound
                }
            }
        };

        function namedScope () {
            var name = id.createUid(8),
                scope = hilary.scope(name);

            expect(scope.context.scope).to.equal(name);
        }

        function generatesName () {
            var scope = hilary.scope();

            expect(typeof scope.context.scope).to.equal('string');
        }

        function scopeWithLogger () {
            var logged,
                parent = hilary.scope(),
                scope = hilary.scope(id.createUid(8), {
                    parent: parent,
                    logging: {
                        level: 'trace',
                        log: function () {
                            logged = true;
                        }
                    }
                });

            scope.register({ name: 'nada', factory: function () {} });
            // if the log function above was called, logged will be true,
            // and we know that the options were accepted
            expect(logged).to.equal(true);
            expect(scope.context.parent).to.equal(parent.context.scope);
        }

        function scopeWithLogPrinter () {
            var logged,
                scope = hilary.scope(id.createUid(8), {
                    logging: {
                        level: 'trace',
                        printer: function () {
                            logged = true;
                        }
                    }
                });

            scope.register({ name: 'nada', factory: function () {} });
            // if the log function above was called, logged will be true,
            // and we know that the options were accepted
            expect(logged).to.equal(true);
        }

        function scopeWithLogLevel () {
            var traceCount = 0,
                errorCount = 0,
                traceScope = hilary.scope(id.createUid(8), {
                    logging: {
                        level: 'trace',
                        printer: function () {
                            // will print everything
                            traceCount += 1;
                        }
                    }
                }),
                errorScope = hilary.scope(id.createUid(8), {
                    logging: {
                        level: 'error',
                        printer: function () {
                            // will not print anything other than error and fatal
                            errorCount += 1;
                        }
                    }
                });

            traceScope.resolve(id.createUid(8));
            errorScope.resolve(id.createUid(8));

            expect(traceCount).to.be.above(errorCount);
        }

        function defaultParentScope () {
            var scope1 = hilary.scope(),
                scope2 = scope1.scope();

            expect(scope1.context.parent).to.equal(undefined);
            expect(scope2.context.parent).to.equal(scope1.name);
        }

        function optionalParentScopeString () {
            var parent = hilary.scope(),
                scope = hilary.scope(id.createUid(8), {
                    parent: parent.context.scope
                });

            expect(scope.context.parent).to.equal(parent.context.scope);
        }

        function optionalParentScopeScope () {
            var parent = hilary.scope(),
                scope = hilary.scope(id.createUid(8), {
                    parent: parent
                });

            expect(scope.context.parent).to.equal(parent.context.scope);
        }

        function optionalParentScopeStringNotFound () {
            var expected = id.createUid(8), // doesn't exist
                scope = hilary.scope(id.createUid(8), {
                    parent: expected
                });

            expect(scope.context.parent).to.equal(expected);
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
