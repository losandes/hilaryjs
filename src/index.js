if (typeof window !== 'undefined') {
    if (!window.polyn) {
        throw new Error('[HILARY] Hilary depends on polyn. Make sure it is included before loading Hilary (https://github.com/losandes/polyn)');
    } else if (!window.__hilary) {
        throw new Error('[HILARY] Hilary modules were loaded out of order');
    }

    (function (polyn, __hilary, window) {
        'use strict';

        var locale = __hilary.locale,
            Exception = __hilary.Exception,
            Container = __hilary.Container(locale, polyn.is, polyn.Immutable, Exception),
            Context = __hilary.Context(polyn.Immutable, Container),
            HilaryModule = __hilary.HilaryModule(polyn.is, polyn.Blueprint, polyn.objectHelper, locale, Exception),
            Logger = __hilary.Logger(polyn.is),
            ResolveTasks = __hilary.ResolveTasks(polyn.async, polyn.is, locale, Exception);

            polyn.Blueprint.configure({
                compatibility: '2017-03-20'
            });

        window.hilary = __hilary.HilaryApi(polyn.async, polyn.is, polyn.id, polyn.Immutable, locale, Logger, Exception, Context, HilaryModule, ResolveTasks);

    }(window.polyn, window.__hilary, window));
} else if (typeof module !== 'undefined' && module.exports) {
    var polyn = require('polyn'),
        locale = require('./locale'),
        Exception = require('./Exception'),
        Container = require('./Container')(locale, polyn.is, polyn.Immutable, Exception),
        Context = require('./Context')(polyn.Blueprint, Container, Exception, locale),
        HilaryModule = require('./HilaryModule')(polyn.is, polyn.Blueprint, polyn.objectHelper, locale, Exception),
        Logger = require('./Logger')(polyn.is),
        ResolveTasks = require('./ResolveTasks')(polyn.async, polyn.is, locale, Exception),
        hilary = require('./HilaryApi')(polyn.async, polyn.is, polyn.id, polyn.Immutable, locale, Logger, Exception, Context, HilaryModule, ResolveTasks);

        polyn.Blueprint.configure({
            compatibility: '2017-03-20'
        });

    module.exports = hilary;
} else {
    throw new Error('[HILARY] Unkown runtime environment');
}
