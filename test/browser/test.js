/*globals createGuid, makeMockData*/
(function (exports, Hilary, spec, createGuid, makeMockData, async, $) {
    'use strict';

    exports['hilary.fixture'](Hilary, spec, createGuid, makeMockData, async);
    exports['hilary.browser.fixture']();
    exports['hilary.di.fixture'](Hilary, spec, createGuid, makeMockData);
    exports['hilary.di.async.fixture'](Hilary, spec, createGuid, makeMockData, async);
    exports['hilary.di.autowire.fixture'](Hilary, spec);
    exports['hilary.singletons.fixture'](Hilary, spec);
    exports['hilary.pipeline.fixture'](Hilary, spec, createGuid, makeMockData, async);
    exports['hilary.browser.jQueryEventEmitter.fixture'](Hilary, spec, $);
    exports['hilary.browser.amd.fixture']();
    exports['hilary.blueprint.fixture'](Hilary, spec);
    exports['hilary.id.fixture'](Hilary, spec);
    exports['hilary.is.fixture'](Hilary, spec);
    exports['hilary.bootstrapper.fixture'](Hilary, spec, createGuid, makeMockData);

}(window, Hilary, spec, createGuid, makeMockData, async, jQuery, mocha));
