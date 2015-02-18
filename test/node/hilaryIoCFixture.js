/*jslint node: true*/
module.exports.test = function (Hilary, spec) {
    "use strict";
    
    var scope = new Hilary(),
        should = spec.should,
        it = spec.it;
    
    spec.describe('Hilary Dependency Injection', function () {
        
        spec.describe('when requiring a module that is not registerd in Hilary', function () {
            it('should attempt to resolve the module, using Node\'s require', function () {
                // when
                var http = scope.resolve('http');
                
                // then
                http.should.not.be.undefined;
                http.createServer.should.not.be.undefined;

            });
        });
        
    }); // /Hilary DI
    
};
