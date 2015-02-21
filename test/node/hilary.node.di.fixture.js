/*jslint node: true*/
module.exports.test = function (Hilary, spec, async) {
    "use strict";
    
    var scope = new Hilary().useAsync(async),
        should = spec.should,
        it = spec.it;
    
    spec.describe('Hilary Dependency Injection (NODE)', function () {
        
        spec.describe('when requiring a module that is not registerd in Hilary', function () {
            it('should attempt to resolve the module, using Node\'s require', function () {
                // when
                var http = scope.resolve('http');
                
                // then
                http.should.not.be.undefined;
                http.createServer.should.not.be.undefined;

            });
            
            it('should attempt to resolve the module, using Node\'s require (async)', function (done) {
                // when
                scope.resolveAsync('http', function (err, http) {
                    // then
                    http.should.not.be.undefined;
                    http.createServer.should.not.be.undefined;
                    done();
                });
            });
        });
        
    }); // /Hilary DI
    
};
