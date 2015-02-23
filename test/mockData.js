/*globals module*/
(function (exports) {
    "use strict";
    
    exports.makeMockData = function (scope, generateId) {
        var testModules = {
                module1: {
                    name: generateId(),
                    expected: generateId()
                },
                module2: {
                    name: generateId(),
                    expected: generateId()
                },
                module3: {
                    name: generateId(),
                    expected: generateId()
                },
                module4: {
                    name: generateId(),
                    expected: generateId()
                }
            };
        
        testModules.module1.moduleDefinition = {
            name: testModules.module1.name,
            factory: function () {
                return testModules.module1.expected;
            }
        };
        
        testModules.module2.moduleDefinition = {
            name: testModules.module2.name,
            dependencies: [testModules.module1.name],
            factory: function (dep) {
                return {
                    dep1Out: dep,
                    thisOut: testModules.module2.expected
                };
            }
        };
        
        testModules.module3.moduleDefinition = {
            name: testModules.module3.name,
            dependencies: [testModules.module1.name, testModules.module2.name],
            factory: function (dep1, dep2) {
                return {
                    dep1Out: dep1,
                    dep2Out: dep2,
                    thisOut: testModules.module3.expected
                };
            }
        };
        
        testModules.module4.moduleDefinition = {
            name: testModules.module4.name,
            factory: {
                val: testModules.module4.expected
            }
        };

        scope.register(testModules.module1.moduleDefinition);
        scope.register(testModules.module2.moduleDefinition);
        scope.register(testModules.module3.moduleDefinition);
        scope.register(testModules.module4.moduleDefinition);
    
        return testModules;
    };
}((typeof module !== 'undefined' && module.exports) ? module.exports : window));
