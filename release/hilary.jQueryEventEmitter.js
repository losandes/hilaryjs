/*! hilary-build 2015-04-04 */
(function(exports, Hilary, $) {
    "use strict";
    Hilary.onInit(function(scope, config) {
        scope.registerEvent("hilary::before::register", function(scope, moduleInfo) {
            $(document).trigger("hilary::before::register", [ {
                scope: scope,
                moduleInfo: moduleInfo
            } ]);
        });
        scope.registerEvent("hilary::after::register", function(scope, moduleInfo) {
            $(document).trigger("hilary::after::register", [ {
                scope: scope,
                moduleInfo: moduleInfo
            } ]);
        });
        scope.registerEvent("hilary::before::resolve", function(scope, moduleName) {
            $(document).trigger("hilary::before::resolve", [ {
                scope: scope,
                moduleName: moduleName
            } ]);
        });
        scope.registerEvent("hilary::after::resolve", function(scope, moduleInfo) {
            $(document).trigger("hilary::after::resolve", [ {
                scope: scope,
                moduleInfo: moduleInfo
            } ]);
        });
        scope.registerEvent("hilary::before::new::child", function(scope, options) {
            $(document).trigger("hilary::before::new::child", [ {
                scope: scope,
                options: options
            } ]);
        });
        scope.registerEvent("hilary::after::new::child", function(scope, options, child) {
            $(document).trigger("hilary::after::new::child", [ {
                scope: scope,
                options: options,
                child: child
            } ]);
        });
        scope.registerEvent("hilary::error", function(err) {
            $(document).trigger("hilary::error", [ {
                err: err
            } ]);
        });
    });
})(window, window.Hilary, window.jQuery);