module.exports.name = 'http';
module.exports.factory = function () {
    'use strict';

    if (/^win/.test(process.platform)) {
        // the platform is a flavor of Windows
        // take advantage of the httpsys performance enhancements
        return require('httpsys').http();
    } else {
        // otherwise, stick with the standard http module
        return require('http');
    }
};
