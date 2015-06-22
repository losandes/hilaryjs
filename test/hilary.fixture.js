/*jslint node: true*/
(function (exports) {
    "use strict";
    
    exports['hilary.fixture'] = function (Hilary, spec, generateId, makeMockData, async) {

        // SETUP
        var scope = new Hilary(),
            should = spec.should,
            expect = spec.expect,
            it = spec.it,
            testModules = makeMockData(scope, generateId);

        // /SETUP

        // SPEC
        spec.describe('Hilary', function () {
            
            var expectScopeToExist = function (scope) {
                expect(scope).to.not.equal(undefined);
                expect(scope.register).to.be.a('function');
                expect(scope.resolve).to.be.a('function');
                expect(scope.getContext().container).to.eql({});
            };
            
            spec.describe('when executed', function () {
                it('should construct a new Hilary instance', function () {
                    expectScopeToExist(new Hilary());
                });
            });
            
            spec.describe('when executed with a name property in the options', function () {
                it('should construct a new Hilary instance', function () {
                    expectScopeToExist(new Hilary());
                });
                
                it('should return an existing Hilary scope if it exists', function () {
                    var specScope = new Hilary({ name: 'newScope3' });
                    
                    Hilary.scope('newScope3').register({
                        name: 'foo',
                        factory: function () {
                            return true;
                        }
                    });
                    
                    expect(Hilary.scope('newScope3').resolve('foo')).to.eql(true);
                });
            });
            
            spec.describe('when scope is called with a valid name', function () {
                it('should construct a new Hilary instance if one does not already exist', function () {
                    var newScope = Hilary.scope('newScope'),
                        existingScope = Hilary.scope('newScope');
                    
                    expectScopeToExist(newScope);
                    expectScopeToExist(existingScope);
                });
                
                it('should return an existing Hilary scope if it exists', function () {
                    Hilary.scope('newScope2');
                    
                    Hilary.scope('newScope2').register({
                        name: 'foo',
                        factory: function () {
                            return true;
                        }
                    });
                    
                    expect(Hilary.scope('newScope2').resolve('foo')).to.eql(true);
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
                
                it('should useAsync if it\'s parent does', function () {
                    var sut = new Hilary().useAsync(async),
                        child = sut.createChildContainer();

                    expect(child.registerAsync).to.be.a('function');
                });
                
                it('should be resolvable by name, if the child scope is named', function () {
                    var sut = Hilary.scope('childSutTest'),
                        child = sut.createChildContainer({ name: 'childSutTestChild' }),
                        child2 = sut.createChildContainer('childSutTestChild2');
                    
                    sut.register({
                        name: 'foo',
                        factory: function () {
                            return true;
                        }
                    });
                    
                    expect(Hilary.scope('childSutTestChild').resolve('foo')).to.eql(true);
                    expect(Hilary.scope('childSutTestChild2').resolve('foo')).to.eql(true);
                });
            });

        });
        
        spec.describe('Hilary Context', function () {
            it('should be open for extension, but closed for modification', function () {
                // given
                var moduleName = generateId(),
                    expected = generateId(),
                    factory,
                    next,
                    shouldNotThrow;

                factory = function () {
                    return expected;
                };
                
                shouldNotThrow = function () {
                    scope.register({
                        name: moduleName,
                        factory: factory
                    });
                };

                // when
                scope.register({
                    name: moduleName,
                    factory: factory
                });

                // then
                scope.getContext().container = {};
                scope.getContext().register = function () {
                    throw new Error('hacked!');
                };
                scope.getContext().container[moduleName].should.not.equal(undefined);
                expect(shouldNotThrow).to.not.Throw();
            });
        });

    };
    
    
}((typeof module !== 'undefined' && module.exports) ? module.exports : window));
