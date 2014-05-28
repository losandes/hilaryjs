var hilary=function(){"use strict";var e,n,t,r;return e=function(){var e={},n=Object.prototype,t=n.toString,r=n.hasOwnProperty,o={},i=["Boolean","Number","String","Function","Array","Date","RegExp","Object","Error"];for(var u in i){var a=i[u];o["[object "+a+"]"]=a.toLowerCase()}return e.isWindow=function(e){return null!=e&&e==e.window},e.type=function(e){return"undefined"==typeof e?"undefined":null===e?String(e):"object"==typeof e||"function"==typeof e?o[t.call(e)]||"object":typeof e},e.notDefined=function(n){try{return"undefined"===e.type(n)}catch(t){return!0}},e.isDefined=function(n){try{return"undefined"!==e.type(n)}catch(t){return!1}},e.isFunction=function(n){return"function"===e.type(n)},e.notFunction=function(n){return"function"!==e.type(n)},e.isArray=function(n){return"array"===e.type(n)},e.notArray=function(n){return"array"!==e.type(n)},e.isObject=function(n){if(!n||"object"!==e.type(n)||n.nodeType||e.isWindow(n))return!1;try{if(n.constructor&&!r.call(n,"constructor")&&!r.call(n.constructor.prototype,"isPrototypeOf"))return!1}catch(t){return!1}var o;for(o in n);return void 0===o||r.call(n,o)},e.isPlainObject=e.isObject,e.notObject=function(n){return e.isObject(n)===!1},e.isEmptyObject=function(e){var n;for(n in e)return!1;return!0},e.isString=function(n){return"string"===e.type(n)},e.notString=function(n){return"string"!==e.type(n)},e.isBoolean=function(n){return"boolean"===e.type(n)},e.notBoolean=function(n){return"boolean"!==e.type(n)},e.notNullOrWhitespace=function(n){if(!n)return!1;if(e.notString(n))throw new Error("Unable to check if a non-string is whitespace.");return/([^\s])/.test(n)},e.isNullOrWhitespace=function(n){return 0==e.notNullOrWhitespace(n)},e}(),n=function(e){var n={};return n.exception=function(n,t,r){var o=e.isString(t)?t:n,i=new Error(o);return i.message=o,n!=o&&(i.name=n),r&&(i.data=r),i},n.argumentException=function(t,r,o){var i=e.notDefined(r)?t:t+" (argument: "+r+")";return n.exception("ArgumentException",i,o)},n.dependencyException=function(t,r,o){var i=e.notDefined(r)?t:t+" (dependency: "+r+")";return n.exception("DependencyException",i,o)},n.notImplementedException=function(e,t){return n.exception("NotImplementedException",e,t)},n}(e),r=function(e,t){throw n.dependencyException("The module cannot be resolved",e)},(t=function(o){var i={},u=o||{},a=u.utils||e,c=u.exceptions||n,s=u.notResolvableHandler||r,f=u.parentContainer,l,p;return l=a.isObject(u.container)?u.container:{},i.confirm=function(e,n){if(a.isNullOrWhitespace(e))throw c.argumentException("The name cannot be null when confirming a dependency","name");if(a.notDefined(n))throw c.argumentException("A dependency is missing, are you missing a reference?",e);return n},i.createContainer=function(e){a.isFunction(u.beforeCreateContainer)&&u.beforeCreateContainer(e);var n=t(e);return a.isFunction(u.afterCreateContainer)&&u.afterCreateContainer(e,n),n},i.createChildContainer=function(e){e=e||{},e.parentContainer=i,a.isFunction(u.beforeCreateContainer)&&u.beforeCreateContainer(e);var n=t(e);return a.isFunction(u.afterCreateContainer)&&u.afterCreateContainer(e,n),n},i.getContainer=function(){return l},i.getParentContainer=function(){return f.getContainer()},i.getContext=i.getContainer,i.use=function(e,n){return a.isFunction(u.beforeUse)&&u.beforeUse(e,n),a.isFunction(e)?e(l):a.isArray(e)&&a.isFunction(n)?(e.unshift(l),n.apply(null,e)):a.isFunction(n)&&n(l),a.isFunction(u.afterUse)&&u.afterUse(e,n),i},i.run=i.use,i.register=function(e,n){return a.isFunction(u.beforeRegister)&&u.beforeRegister(e,n),a.isFunction(e)?p(e):(a.notString(e)&&c.argumentException("The first argument must be the name of the module","moduleNameOrFunc"),a.notDefined(n)&&c.argumentException("The second argument must be the module definition","moduleDefinition"),l[e]=n,a.isFunction(u.afterRegister)&&u.afterRegister(e,n),i)},p=function(e){return a.notFunction(e)?c.argumentException("The first argument must be a function that accepts on parameter: container","moduleFunc"):e(l),i},i.moduleExists=function(e){var n=l[e];return void 0!==n?!0:void 0===f?!1:f.moduleExists(e)},i.resolveOne=function(e){a.isFunction(u.beforeResolveOne)&&u.beforeResolveOne(e);var n=l[e];return void 0!==n?n:(void 0===f&&s(e,i),f.resolveOne(e))},i.resolve=function(e,n){if(a.isFunction(u.beforeResolve)&&u.beforeResolve(e,n),a.isString(e)){var t=i.resolveOne(e);return a.isFunction(u.afterResolve)&&u.afterResolve(e,n),t}if(!a.isArray(e)||!a.isFunction(n))throw c.argumentException("one or more of the arguments passed are invalid","module name, dependencies or callback");var r=[];for(var o in e){var s=e[o];r.push("$container"===s?l:"$parentContainer"===s&&void 0!==f?i.getParentContainer():"$parentContainer"===s?null:i.resolveOne(s))}return n.apply(null,r),a.isFunction(u.afterResolve)&&u.afterResolve(e,n),i},i})({utils:e,exceptions:n,notResolvableHandler:r})}();