(function (register) {
    'use strict';

    register({
        name: 'Context',
        factory: Context
    });

    function Context(Blueprint, Container, Exception, locale) {
        var IContext = new Blueprint({
            __blueprintId: 'Hilary::Context',
            scope: 'string',
            parent: {
                type: 'string',
                required: false
            },
            container: {
                type: 'object',
                required: false
            },
            singletonContainer: {
                type: 'object',
                required: false
            }
        });

        return function Ctor (options) {
            var self = {};

            if (!IContext.validate(options).result) {
                return new Exception({
                    type: locale.errorTypes.INVALID_ARG,
                    messages: IContext.validate(options).errors
                });
            }

            setReadOnlyProperty(self, 'scope', options.scope);
            self.parent = options.parent; // parent is mutable
            setReadOnlyProperty(self, 'container', options.container || new Container());
            setReadOnlyProperty(self, 'singletonContainer', options.singletonContainer || new Container());

            return self;
        };
    }


    function setReadOnlyProperty (obj, name, value) {
        Object.defineProperty(obj, name, {
          enumerable: true,
          configurable: false,
          get: function () {
              return value;
          },
          set: function () {
              console.log(name + ' is read only');
          }
        });
    } // /setReadOnlyProperty

}(function (registration) {
    'use strict';

    try {
        if (typeof module !== 'undefined' && module.exports) {
            module.exports = registration.factory;
        } else if (typeof window !== 'undefined') {
            window.__hilary = window.__hilary || {};
            window.__hilary[registration.name] = registration.factory;
        } else {
            throw new Error('[HILARY] Unkown runtime environment');
        }
    } catch (e) {
        var name = registration && registration.name ? registration.name : 'MISSING NAME';
        var err = new Error('[HILARY] Registration failure: ' + name);
        err.cause = e;
        throw err;
    }
}));
