/*jslint node: true*/
module.exports.test = function (Hilary, spec) {
    "use strict";
    
    var scope = new Hilary(),
        should = spec.should,
        it = spec.it;
    
    spec.describe('Hilary Singletons', function () {
        
        spec.describe('when a module is registered as a singleton', function () {
            it('should always resolve the single instance', function () {
                // given
                var sut,
                    sut2;
                
                scope.register('sutCtor', function () {
                    return {
                        state: 'on'
                    };
                });
                
                scope.register('sut', scope.resolve('sutCtor'));
                
                // when
                sut = scope.resolve('sut');
                sut.state.should.equal('on');
                sut.state = 'off';
                
                // then
                sut2 = scope.resolve('sut');
                sut2.state.should.equal('off');
            });
        });
        
    }); // /Hilary DI
    
};
