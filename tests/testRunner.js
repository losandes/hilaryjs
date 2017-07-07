// jshint mocha:true
// globals: describe, it, xit, before, after
(function (register) {
    'use strict';

    register({
        name: 'testRunner',
        factory: TestRunner()
    });

    function TestRunner () {
        return {
            describe: describe,
            run: run
        };

        function run (spec) {
            var behavior;

            for (behavior in spec) {
                if (spec.hasOwnProperty(behavior)) {
                    describe(behavior, runBehavior(spec[behavior]));
                }
            }
        }

        function runBehavior (behavior) {
            return function () {
                var assertion;

                for (assertion in behavior) {
                    if (behavior.hasOwnProperty(assertion)) {
                        if (typeof behavior[assertion] === 'function') {
                            if (behavior[assertion].skip) {
                                xit(assertion, function () {});
                            // jshint -W035
                            } else if (behavior[assertion].differentRuntime) {
                                // do nothing - this shouldn't effect the stats
                            } else {
                            // jshint +W035
                                it(assertion, behavior[assertion]);
                            }
                        } else {
                            describe(assertion, runBehavior(behavior[assertion]));
                        }
                    }
                }

            };
        }
    } // /factory

}(function (registration) {
    'use strict';

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = registration.factory;
    } else if (typeof window !== 'undefined') {
        window.fixtures = window.fixtures || {};
        window.fixtures[registration.name] = registration.factory;
    } else {
        throw new Error('[HILARY-TESTS] Unkown runtime environment');
    }
}));
