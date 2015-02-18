(function (exports, Hilary, $) {
    "use strict";
    
    Hilary.onInit(function (scope, config) {
        scope.registerEvent('hilary::before::register', function (scope, moduleName, moduleDefinition) {
            $(document).trigger('hilary::before::register', [{ scope: scope, moduleName: moduleName, moduleDefinition: moduleDefinition }]);
        });

        scope.registerEvent('hilary::after::register', function (scope, moduleName, moduleDefinition) {
            $(document).trigger('hilary::after::register', [{ scope: scope, moduleName: moduleName, moduleDefinition: moduleDefinition }]);
        });
        
        scope.registerEvent('hilary::before::resolve', function (scope, moduleName) {
            $(document).trigger('hilary::before::resolve', [{ scope: scope, moduleName: moduleName }]);
        });
        
        scope.registerEvent('hilary::after::resolve', function (scope, moduleName, result) {
            $(document).trigger('hilary::after::resolve', [{ scope: scope, moduleName: moduleName, result: result }]);
        });
        
        scope.registerEvent('hilary::before::new::child', function (scope, options) {
            $(document).trigger('hilary::before::new::child', [{ scope: scope, options: options }]);
        });
        
        scope.registerEvent('hilary::after::new::child', function (scope, options, child) {
            $(document).trigger('hilary::after::new::child', [{ scope: scope, options: options, child: child }]);
        });
    });

}(window, window.Hilary, window.jQuery));
