(function (exports) {
    'use strict';
    
    exports['hilary.bootstrapper.fixture'] = function (Hilary, spec, generateId, makeMockData) {
    
        var describe = spec.describe,
            it = spec.it,
            expect = spec.expect;
        
        describe('Hilary Bootstrapper', function () {

            describe('when executed with a onComposed function', function () {
                it('should execute onComposed when no arguments are provided', function (done) {
                    // given
                    var sutScope = new Hilary();
                    
                    // when
                    sutScope.Bootstrapper({
                        onComposed: function () {
                            // then
                            done();
                        }
                    });
                });
                
                it('should receive an error as the first argument, if composeLifecycle passes one in', function (done) {
                    // given
                    var sutScope = new Hilary();
                    
                    // when
                    sutScope.Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline, next) {
                            next({ status: 500 }, scope);
                        },
                        onComposed: function (err) {
                            // then
                            expect(err.status).to.equal(500);
                            done();
                        }
                    });
                });
                
                it('should receive the scope as the second argument, if composeLifecycle is not defined', function (done) {
                    // given
                    var sutScope = new Hilary();
                    
                    // when
                    sutScope.Bootstrapper({
                        onComposed: function (err, scope) {
                            // then
                            expect(typeof scope.register).to.equal('function');
                            done();
                        }
                    });
                });
                
                it('should receive the scope as the second argument, if composeLifecycle passes it in', function (done) {
                    // given
                    var sutScope = new Hilary();
                    
                    // when
                    sutScope.Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline, next) {
                            next({ status: 500 }, scope);
                        },
                        onComposed: function (err, scope) {
                            // then
                            expect(typeof scope.register).to.equal('function');
                            done();
                        }
                    });
                });

                it('should allow the scope to be affected by all other arguments of the bootstrapper', function (done) {
                    // given
                    var sutScope = new Hilary(),
                        expected1 = 'containerTest1',
                        expected2 = 'containerTest2';
                    
                    // when
                    sutScope.Bootstrapper({
                        composeModules: function (err, scope) {
                            scope.register({ name: expected1, factory: function () { return expected1; } });
                        },
                        composeLifecycle: function (err, scope) {
                            scope.register({ name: expected2, factory: function () { return expected2; } });
                        },
                        onComposed: function (err, scope) {
                            // then
                            expect(scope.resolve(expected1)).to.equal(expected1);
                            expect(scope.resolve(expected2)).to.equal(expected2);
                            done();
                        }
                    });
                });
            }); // /start
            
            describe('when executed with a composeModules function', function () {
                it('should execute composeModules when no arguments are provided', function (done) {
                    // given
                    var sutScope = new Hilary();
                    
                    // when
                    sutScope.Bootstrapper({
                        composeModules: function () {
                            // then
                            done();
                        }
                    });
                });
                
                it('should receive the scope as the second argument', function (done) {
                    // given
                    var sutScope = new Hilary();
                    
                    // when
                    sutScope.Bootstrapper({
                        composeModules: function (err, scope) {
                            // then
                            expect(typeof scope.register).to.equal('function');
                            done();
                        }
                    });
                });
                
                it('should pass in a function with 2 arguments for the next parameter if it is declared', function (done) {
                    // given
                    var sutScope = new Hilary();
                    
                    // when
                    sutScope.Bootstrapper({
                        composeModules: function (err, scope, next) {
                            // then
                            expect(typeof next).to.equal('function');
                            expect(next.length).to.equal(2);
                            done();
                        }
                    });
                });
                
                it('should allow the scope to be affected by the bootstrapper', function (done) {
                    // given
                    var sutScope = new Hilary(),
                        expected = 'containerTest';
                    
                    // when
                    sutScope.Bootstrapper({
                        composeModules: function (err, scope) {
                            scope.register({
                                name: expected,
                                factory: function () {
                                    return expected;
                                }
                            });
                        },
                        composeLifecycle: function (err, scope, pipeline) {
                            // then
                            expect(scope.resolve(expected)).to.equal(expected);
                            done();
                        }
                    });
                });
            }); // /composeModules
            
            describe('when executed with a composeLifecycle function', function () {
                it('should execute composeLifecycle when no arguments are provided', function (done) {
                    // given
                    var sutScope = new Hilary();
                    
                    // when
                    sutScope.Bootstrapper({
                        composeLifecycle: function () {
                            // then
                            done();
                        }
                    });
                });
                
                it('should receive an error as the first argument, if composeModules passes one in', function (done) {
                    // given
                    var sutScope = new Hilary();
                    
                    // when
                    sutScope.Bootstrapper({
                        composeModules: function (err, scope, next) {
                            next({ status: 500 }, scope);
                        },
                        composeLifecycle: function (err) {
                            // then
                            expect(err.status).to.equal(500);
                            done();
                        }
                    });
                });
                
                it('should receive the scope as the second argument, if composeModules is not defined', function (done) {
                    // given
                    var sutScope = new Hilary();
                    
                    // when
                    sutScope.Bootstrapper({
                        composeLifecycle: function (err, scope) {
                            // then
                            expect(typeof scope.register).to.equal('function');
                            done();
                        }
                    });
                });
                
                it('should receive the scope as the second argument, if composeModules passes it in', function (done) {
                    // given
                    var sutScope = new Hilary();
                    
                    // when
                    sutScope.Bootstrapper({
                        composeModules: function (err, scope, next) {
                            next({ status: 500 }, scope);
                        },
                        composeLifecycle: function (err, scope) {
                            // then
                            expect(typeof scope.register).to.equal('function');
                            done();
                        }
                    });
                });
                
                it('should receive the Hilary pipeline as the third argument', function (done) {
                    // given
                    var sutScope = new Hilary();
                    
                    // when
                    sutScope.Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            // then
                            expect(typeof pipeline).to.equal('object');
                            done();
                        }
                    });
                });
                
                it('should allow the pipelines to be affected by the bootstrapper', function (done) {
                    // given
                    var sutScope = new Hilary(),
                        expected = 'pipelineTest';
                    
                    // when
                    sutScope.Bootstrapper({
                        composeLifecycle: function (err, scope, pipeline) {
                            pipeline.registerEvent('hilary::before::register', function (scope, moduleInfo) {
                                // then
                                expect(moduleInfo.name).to.equal(expected);
                                done();
                            });
                        }
                    });
                    
                    sutScope.register({
                        name: expected,
                        factory: function () {}
                    });
                });
            }); // /composeModules
            
        });
        
    };

}((typeof module !== 'undefined' && module.exports) ? module.exports : window));
