'use strict';

var hilary = require('../../index.js'), //require('hilary');
    scope = hilary.scope('myApp', {
        logging: {
            level: 'trace',
            log: function (level, entry) {
                if (level < 10 || level === 70) {
                    return;
                }

                switch(level) {
                    case 60:
                        console.log('[FATAL]', entry);
                        break;
                    case 50:
                        console.log('[ERROR]', entry);
                        break;
                    case 40:
                        console.log('[WARN]', entry);
                        break;
                    case 30:
                        console.log('[INFO]', entry);
                        break;
                    case 20:
                        console.log('[DEBUG]', entry);
                        break;
                    case 10:
                        console.log('[TRACE]', entry);
                        break;
                    default:
                        console.log(entry);
                        break;
                }
            }
        }
    });

scope.register({
    name: 'foo',
    factory: 42
});
