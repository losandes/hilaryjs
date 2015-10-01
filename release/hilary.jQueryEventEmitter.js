/*! hilary-build 2015-10-01 */
(function(Hilary, $) {
    "use strict";
    Hilary.onInit(function(scope) {
        var pipeline = scope.getContext().pipeline;
        pipeline.register.before.register(function(err, payload) {
            $(document).trigger("hilary::before::register", [ payload ]);
        });
        pipeline.register.after.register(function(err, payload) {
            $(document).trigger("hilary::after::register", [ payload ]);
        });
        pipeline.register.before.resolve(function(err, payload) {
            $(document).trigger("hilary::before::resolve", [ payload ]);
        });
        pipeline.register.after.resolve(function(err, payload) {
            $(document).trigger("hilary::after::resolve", [ payload ]);
        });
        pipeline.register.before.newChild(function(err, payload) {
            $(document).trigger("hilary::before::new::child", [ payload ]);
        });
        pipeline.register.after.newChild(function(err, payload) {
            $(document).trigger("hilary::after::new::child", [ payload ]);
        });
        pipeline.register.on.error(function(err) {
            $(document).trigger("hilary::error", [ {
                err: err
            } ]);
        });
    });
})(window.Hilary, window.jQuery);