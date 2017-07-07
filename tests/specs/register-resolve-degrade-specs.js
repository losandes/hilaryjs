(function (register) {
    'use strict';

    register({
        name: 'register-resolve-degrade-specs',
        Spec: Spec
    });

    function Spec (hilary, expect, id, ifBrowser, ifNode) {
        return {
            'when a module that is NOT registered is resolved,': {
                'it should gracefully degrade to require': ifNode(degradeToRequire),
                'it should NOT register degraded module as a singleton (node)': ifNode(degradeToRequireNoSingleton),
                'it should gracefully degrade to window': ifBrowser(degradeToWindow),
                'it should NOT register degraded module as a singleton (browser)': ifBrowser(degradeToWindowNoSingleton)
            }
        };

        function degradeToRequire () {
            // given
            var scope = hilary.scope(),
                actual;

            // a module that depends on a module that is included in Node.js
            // or installed dependencies
            scope.register({
                name: 'foo',
                dependencies: ['http'],
                factory: function (http) {
                    this.http = http;
                }
            });

            // when
            actual = scope.resolve('foo');

            // then
            expect(typeof actual.http.request).to.equal('function');
        }

        function degradeToWindow () {
            // given
            var scope = hilary.scope(),
                moduleName = id.createUid(8),
                actual;

            // an object on window
            window[moduleName] = { foo: 'bar' };

            // and a module that depends on that object
            scope.register({
                name: 'foo',
                dependencies: [moduleName],
                factory: function (onWindow) {
                    this.onWindow = onWindow;
                }
            });

            // when
            actual = scope.resolve('foo');

            // then
            expect(actual.onWindow.foo).to.equal('bar');
        }

        function degradeToRequireNoSingleton () {
            // given
            var scope = hilary.scope(),
                actual;

            // a module that depends on a module that is included in Node.js
            // or installed dependencies
            scope.register({
                name: 'foo',
                dependencies: ['http'],
                factory: function (http) {
                    this.http = http;
                }
            });

            // when
            actual = scope.resolve('foo');

            // then
            expect(typeof actual.http.request).to.equal('function');
            expect(scope.context.singletonContainer.resolve('http')).to.equal(undefined);
        }

        function degradeToWindowNoSingleton () {
            // given
            var scope = hilary.scope(),
                moduleName = id.createUid(8),
                actual;

            // an object on window
            window[moduleName] = { foo: 'bar' };

            // and a module that depends on that object
            scope.register({
                name: 'foo',
                dependencies: [moduleName],
                factory: function (onWindow) {
                    this.onWindow = onWindow;
                }
            });

            // when
            actual = scope.resolve('foo');

            // then
            expect(actual.onWindow.foo).to.equal('bar');
            expect(scope.context.singletonContainer.resolve(moduleName)).to.equal(undefined);
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
