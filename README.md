hilary.js
========

Hilary is an easy to use JavaScript Inversion of Control (IoC) container written for Node.js and the browser.  Hilary's aim is to deliver low-ceremony dependency injection (DI), to aid in decoupling JavaScript modules and testing.  It's named after Hilary Page, who designed building blocks that later became known as Legos.

You can find documentation and examples on our [wiki](https://github.com/Acatar/hilaryjs/wiki). Below is just a quick-start.

> Hilary 2.0 is not backwards compatible with previous versions of Hilary. We don't intend to release a backwards compatibility extension because v1 was in the wild for such a short time. If you already built a lot around v1, open an issue, and we will help you with compatibility/upgrades.

Creating your First Node App with Hilary
========
Install Hilary:

```
npm install hilary
```

In your startup file, require Hilary, create a new scope, and compose your app.

```JavaScript
// startup.js
"use strict";

var compose,
    start;

// Compose the dependency graph
// and register things like singletons
compose = function (scope) {
    var isWin = /^win/.test(process.platform),
        httpSingleton;
            
    if (isWin) {
        // take advantage of the httpsys performance enhancements
        httpSingleton =  require('httpsys').http();
    } else {
        // otherwise, stick with the standard http module
        httpSingleton = require('http');
    }
    
    // register the http singleton
    scope.register({
        name: 'http',
        factory: function () {
            return httpSingleton;        
        }
    });
    
    // register the exports from www.js
    scope.register(require('./www.js'));
};

start = function () {
    // create a scope for our application lifetime
    var Hilary = require('hilary'),
        scope = Hilary.scope('app');
    
    // compose the application lifetime
    compose(scope);
    
    // Usually, resolving module(s) will result in 
    // your application starting up
    scope.resolve('server');
};

// Start the app
start();

```

```JavaScript
// www.js
module.exports.name = 'server';
module.exports.factory = function (http) {
    "use strict";
    
    http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Hello World\n');
    }).listen(1337, '127.0.0.1');

    console.log('Server running at http://127.0.0.1:1337/');
    
    return http;
};
```

Creating your First Browser App with Hilary
========
Install Hilary (or you can download the source):

```
bower install hilary
```

Add a script reference to Hilary before you load your modules:

```HTML
<script src="hilary.min.js"></script>
```

Then register modules on a named scope, and finally compose your app:

```JavaScript
// myRouteEngine.js
Hilary.scope('spa').register({
    // other modules can depend on this one by name
    name: 'myRouteEngine',
    // Hilary will try to resolve "someSingleton" by 
    // looking for registrations by that name
    factory: function (someSingleton) {
        "use strict";

        console.log(someSingleton);
    }
});
```

```JavaScript
// bootstrapper.js
(function (spa) {
    "use strict";
    
    var compose;
    
    // Compose the dependency graph
    // and register things like singletons
    compose = function () {
        var singleton = 'hello world!';
        
        spa.register({
            // other modules can depend on this one by name
            name: 'someSingleton',
            // Parameterless factories are executed when being 
            // resolved. The result of this function will be passed 
            // to any factories that depend on "someSingleton".
            factory: function () {
                "use strict";

                return singleton;
            }
        });
    };
    
    // start
    (function () {
        // Compose the application
        compose();
        
        // Usually, resolving module(s) will result in 
        // your application starting up
        spa.resolve('myRouteEngine');
    }());
    
}(Hilary.scope('spa')));
```
