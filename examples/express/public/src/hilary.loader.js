/*jslint plusplus: true*/
/*globals module, Hilary, HilaryModule*/
(function (document) {
    "use strict";
    
    var stateChange,
        appendScriptToDom,
        // DOM appending concept from http://www.html5rocks.com/en/tutorials/speed/script-loading
        firstScript = document.scripts[0],
        pendingScripts = [],
        enforceLeadingSlash,
        removeLeadingSlash,
        enforceTrailingSlash,
        normalizeUrl;
    
    enforceLeadingSlash = function (str) {
        return str.substring(0, 1) === '/' ? str : '/' + str;
    };

    removeLeadingSlash = function (str) {
        while (str.substring(0, 1) === '/') {
            return removeLeadingSlash(str.substring(1));
        }

        return str;
    };

    enforceTrailingSlash = function (str) {
        return str.substring(str.length - 1, str.length) === '/' ? str : str + '/';
    };
    
    normalizeUrl = function (baseUrl, relativeUrl) {
        return enforceLeadingSlash(enforceTrailingSlash(baseUrl))
            + removeLeadingSlash(relativeUrl);
    };

    // Watch scripts load in IE
    stateChange = function () {
        // Execute as many scripts in order as we can
        var pendingScript;
        while (pendingScripts[0] && pendingScripts[0].readyState === 'loaded') {
            pendingScript = pendingScripts.shift();
            // avoid future loading events from this script (eg, if src changes)
            pendingScript.onreadystatechange = null;
            // can't just appendChild, old IE bug if element isn't closed
            firstScript.parentNode.insertBefore(pendingScript, firstScript);
        }
    };

    appendScriptToDom = function (src) {
        var script;
        
        if (firstScript.hasOwnProperty('async')) { // modern browsers
            script = document.createElement('script');
            script.async = true;
            script.src = src;
            document.head.appendChild(script);
            //document.getElementsByTagName(appendTo)[0].appendChild(script);
        } else if (firstScript.readyState) { // IE<10
            // create a script and add it to our todo pile
            script = document.createElement('script');
            pendingScripts.push(script);
            // listen for state changes
            script.onreadystatechange = stateChange;
            // must set src AFTER adding onreadystatechange listener
            // else we’ll miss the loaded event for cached scripts
            script.src = src;
        } else { // fall back to defer
            document.write('<script src="' + src + '" defer></script>');
        }
    };
    
    Hilary.onInit(function (scope, options) {
        scope.baseUrl = (options.baseUrl && enforceLeadingSlash(enforceTrailingSlash(options.baseUrl))) || '/scripts/';
        //scope.appendScriptsTo = options.appendScriptsTo || 'body';
    });
    
    Hilary.extend('loadDependency', function (scope) {
        var constants = scope.getConstants();
        
        return function (moduleName, callback) {
            var eventHandler = function (container, mod) {
                if (mod === moduleName) {
                    callback(mod);
                }
            };
            eventHandler.once = true;
            
            scope.registerEvent(constants.pipeline.afterRegister, eventHandler);
            
            appendScriptToDom(scope.baseUrl + removeLeadingSlash(moduleName) + '.js');
            
            return scope;
        };
    });

}(document));