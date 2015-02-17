/*jslint node: true*/
module.exports.test = function (Hilary, spec) {
    "use strict";
    
    var scope = new Hilary();
    
    spec.describe('Hilary Dependency Injection', function () {
        
        spec.describe('when requiring a module that is not registerd in Hilary', function () {
            spec.it('should attempt to resolve the module, using Node\'s require', function () {
                // when
                var http = scope.resolve('http');

                spec.expect(http).to.not.be.undefined;
                spec.expect(http.createServer).to.not.be.undefined;
            });
        });
        
    }); // /Hilary DI
    
};
