(function (exports, Hilary, $) {
    "use strict";
    
    Hilary.onInit(function (scope, config) {
        scope.registerEvent('hilary::before::register', function (container, moduleName, moduleDefinition) {
            $(document).trigger('hilary::before::register', [{ container: container, moduleName: moduleName, moduleDefinition: moduleDefinition }]);
        });

        scope.registerEvent('hilary::after::register', function (container, moduleName, moduleDefinition) {
            $(document).trigger('hilary::after::register', [{ container: container, moduleName: moduleName, moduleDefinition: moduleDefinition }]);
        });
        
        scope.registerEvent('hilary::before::resolve', function (container, moduleName, moduleDefinition) {
            $(document).trigger('hilary::before::resolve', [{ container: container, moduleName: moduleName, moduleDefinition: moduleDefinition }]);
        });
        
        scope.registerEvent('hilary::after::resolve', function (container, moduleName, moduleDefinition) {
            $(document).trigger('hilary::after::resolve', [{ container: container, moduleName: moduleName, moduleDefinition: moduleDefinition }]);
        });
        
        scope.registerEvent('hilary::before::new::child', function (container, moduleName, moduleDefinition) {
            $(document).trigger('hilary::before::new::child', [{ container: container, moduleName: moduleName, moduleDefinition: moduleDefinition }]);
        });
        
        scope.registerEvent('hilary::after::new::child', function (container, moduleName, moduleDefinition) {
            $(document).trigger('hilary::after::new::child', [{ container: container, moduleName: moduleName, moduleDefinition: moduleDefinition }]);
        });
    });

}(window, window.Hilary, window.jQuery));
