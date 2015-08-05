hilary.js
========

Hilary is an easy to use JavaScript Inversion of Control (IoC) container written for Node.js and the browser.  Hilary's aim is to deliver low-ceremony dependency injection (DI), to aid in decoupling JavaScript modules and testing.  It's named after Hilary Page, who designed building blocks that later became known as Legos.

Also check out [generator-hilary](https://github.com/losandes/generator-hilary), our Yeoman generator, and [Gidget](https://github.com/Acatar/gidget) our route/app engine.

> You can find documentation and examples on our [wiki](https://github.com/Acatar/hilaryjs/wiki). Below is just a quick-start.

> If the bootstrapper in the examples that follow looks foreign to you, consider reading about the [composition root pattern](http://blog.ploeh.dk/2011/07/28/CompositionRoot/).

Creating your First Node App with Hilary
========
Install Hilary:

```
npm install --save hilary
```

To get started, we'll create our first Module: an HTTP module: ``www.js``. We need to export a ``name`` and a ``factory`` at a minimum. Checkout [Registering Modules](https://github.com/Acatar/hilaryjs/wiki/Registering-Modules) for more detailed instructions.

Note that we're not referencing Hilary yet. We're going to do that in the next step.

```JavaScript
// www.js
module.exports.name = 'server';
module.exports.factory = function (http) {
    'use strict';

    http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Hello World\n');
    }).listen(1337, '127.0.0.1');

    console.log('Server running at http://127.0.0.1:1337/');

    return http;
};
```

Now create a bootstrapper/startup file. We'll call it ``startup.js``. Then we'll ``require`` Hilary, create our ``scope`` and compose our application using Hilary's ``Bootstrapper``.

```JavaScript
// startup.js
'use strict';

var Hilary = require('hilary');

Hilary.scope('app').Bootstrapper({
    // Compose the lifecycle (listen to events)
    composeLifecycle: function (err, scope, pipeline) {
        pipeline.register.on.error(function (err) {
            console.log(err);
        });
    },
    // Compose the dependency graph
    // and register things like singletons
    composeModules: function (err, scope) {
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
    },
    onComposed: function (err, scope) {
        if (!err) {
            throw err;
        }

        // Usually, resolving module(s) will result in
        // your application starting up
        scope.resolve('server');
    }
});
```

Creating your First Browser App with Hilary
========
You can either install Hilary with bower or download it from the [latest Release](https://github.com/Acatar/hilaryjs/releases), and reference the appropriate files in the release folder.

```Shell
bower install --save hilary
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
    'use strict';

    spa.Bootstrapper({
        // Compose the lifecycle (listen to events)
        composeLifecycle: function (err, scope, pipeline) {
            pipeline.register.on.error(function (err) {
                if (err.message) {
                    throw err;
                } else {
                    throw new Error(err);
                }
            });
        },
        // Compose the dependency graph
        // and register things like singletons
        composeModules: function (err, scope) {
            var singleton = 'hello world!';

            spa.register({
                // other modules can depend on this one by name
                name: 'someSingleton',
                // Parameterless factories are executed when being
                // resolved. The result of this function will be passed
                // to any factories that depend on "someSingleton".
                factory: function () {
                    return singleton;
                }
            });
        },
        onComposed: function (err, scope) {
            if (err) {
                throw err;
            }

            // Usually, resolving module(s) will result in
            // your application starting up
            spa.resolve('myRouteEngine');
        }
    });

}(Hilary.scope('spa')));
```
