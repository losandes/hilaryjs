/*jslint regexp: true*/
/*globals mocha, describe, it, chai*/
(function (exports, mocha) {
    "use strict";
    
    mocha.setup({
        ui: 'bdd'
    });

    exports.createGuid = function () {
        return "zxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === "x" ? r : r & 3 | 8;
            return v.toString(16);
        });
    };

    exports.spec = {
        describe: describe,
        it: it,
        expect: chai.expect,
        should: chai.should()
    };
    
}(window, mocha));

