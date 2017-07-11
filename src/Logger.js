(function (register) {
    'use strict';

    register({
        name: 'Logger',
        factory: Logger
    });

    function Logger (is) {
        return function (options) {
            var log = makeLogHandler(new Options(options));

            return {
                trace: function () { log(10, arguments); },
                debug: function () { log(20, arguments); },
                info:  function () { log(30, arguments); },
                warn:  function () { log(40, arguments); },
                error: function () { log(50, arguments); },
                fatal: function () { log(60, arguments); },
            };
        };

        function Options (options) {
            var level, log, printer;

            if (typeof options === 'string') {
                options = {};
            } else {
                options = options || {};
            }

            options.logging = options.logging || {};

            if (options.logging.level && is.string(options.logging.level)) {
                switch (options.logging.level) {
                    case 'debug': level = 20; break;
                    case 'info': level = 30; break;
                    case 'warn': level = 40; break;
                    case 'error': level = 50; break;
                    case 'fatal': level = 60; break;
                    case 'off': level = 70; break;
                    default: level = 10; break;
                }
            } else if (
                options.logging.level &&
                is.number(options.logging.level) &&
                options.logging.level > 0 &&
                options.logging.level <= 70
            ) {
                level = options.logging.level;
            } else {
                level = 30;
            }

            log = is.function(options.logging.log) ? options.logging.log : null;
            printer = is.function(options.logging.printer) ? options.logging.printer : null;

            return {
                level: level,
                log: log,
                printer: printer
            };
        } // /Options

        function makeLogHandler (options) {
            if (options.log) {
                return function (level, entry) {
                    return options.log(level, new Entry(entry[0]));
                };
            } else if (options.printer) {
                return function (level, entry) {
                    if (level < options.level) {
                        return;
                    }

                    return options.printer(new Entry(entry[0]));
                };
            } else {
                return function (level, entry) {
                    var printer;

                    if (level < options.level) {
                        return;
                    }

                    switch(level) {
                        case 60:
                            printer = console.error || console.log;
                            break;
                        case 50:
                            printer = console.error || console.log;
                            break;
                        case 40:
                            printer = console.warn || console.log;
                            break;
                        default:
                            printer = console.log;
                            break;
                    }

                    printer.apply(null, new Entry(entry));
                };
            }
        } // /makeLogHandler

        function Entry (entry) {
            if (is.string(entry)) {
                return { message: entry };
            }

            return entry;
        }
    } // /Logger

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
