/*jslint node: true*/
(function (exports) {
    "use strict";
    
    exports['hilary.fixture'] = function (Hilary, spec, generateId, makeMockData) {

        // SETUP

        var scope = new Hilary(),
            should = spec.should,
            expect = spec.expect,
            it = spec.it,
            testModules = makeMockData(scope, generateId);

        // /SETUP

        // SPEC
        spec.describe('Hilary', function () {
            spec.describe('when executed', function () {
                it('should construct a new Hilary instance', function () {
                    var specScope = new Hilary();
                    
                    expect(specScope).to.not.equal(undefined);
                    expect(specScope.register).to.be.a('function');
                    expect(specScope.resolve).to.be.a('function');
                    expect(specScope.getContext().container).to.eql({});
                });
            });
            
            spec.describe('when createChildContainer is executed, the child instance', function () {
                it('should be a new Hilary instance', function () {
                    var child = scope.createChildContainer();

                    expect(child).to.not.equal(undefined);
                    expect(child.register).to.be.a('function');
                    expect(child.resolve).to.be.a('function');
                    expect(child.getContext().container).to.eql({});
                });
                
                it('should have a pointer to the parent scope', function () {
                    var child = scope.createChildContainer();

                    expect(child.getContext().parent).to.not.equal(undefined);
                    expect(child.getContext().parent.getContext().container).to.not.eql({});
                });

                it('should support hierarchical resolution', function () {
                    var specScope = new Hilary(),
                        child = specScope.createChildContainer(),
                        shouldThrow,
                        actual1,
                        actual2,
                        actual3;

                    // given
                    specScope.register(testModules.module1.moduleDefinition);
                    child.register(testModules.module2.moduleDefinition);

                    shouldThrow = function () {
                        return specScope.resolve(testModules.module2.name);
                    };

                    // when
                    actual1 = specScope.resolve(testModules.module1.name);
                    actual2 = child.resolve(testModules.module2.name);
                    actual3 = child.resolve(testModules.module1.name);

                    // then
                    expect(actual1).to.equal(testModules.module1.expected);
                    expect(actual2.thisOut).to.equal(testModules.module2.expected);
                    expect(actual3).to.equal(testModules.module1.expected);
                    expect(shouldThrow).to.Throw();
                });
            });

        });
        
        spec.describe('Hilary Context', function () {
            it('should be open for extension, but closed for modification', function () {
                // given
                var moduleName = generateId(),
                    expected = generateId(),
                    factory,
                    next;

                factory = function () {
                    return expected;
                };

                // when
                scope.register({
                    name: moduleName,
                    factory: factory
                });

                // then
                scope.getContext().container = {};
                scope.getContext().container[moduleName].should.not.equal(undefined);
            });
        });

    };
    
    
}((typeof module !== 'undefined' && module.exports) ? module.exports : window));
