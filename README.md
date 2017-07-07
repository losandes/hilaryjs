hilary.js
=========

Hilary is an easy to use JavaScript Inversion of Control (IoC) container written for [Node.js](https://github.com/losandes/hilaryjs/blob/master/README.md#creating-your-first-node-app-with-hilary) and the [browser](https://github.com/losandes/hilaryjs/blob/master/README.md#creating-your-first-browser-app-with-hilary).  Hilary's aim is to deliver low-ceremony dependency injection (DI), to aid in decoupling JavaScript modules and testing.  It's named after Hilary Page, who designed building blocks that later became known as Legos.

Also check out [generator-hilary](https://github.com/losandes/generator-hilary), our Yeoman generator, and [Gidget](https://github.com/Acatar/gidget) our route/app engine.

> You can find documentation and examples on our [wiki](https://github.com/Acatar/hilaryjs/wiki). Below is just a quick-start.

> If the bootstrapper in the examples that follow looks foreign to you, consider reading about the [composition root pattern](http://blog.ploeh.dk/2011/07/28/CompositionRoot/).

## Getting Started with Node.js
Install Hilary:

```
npm install --save hilary
```

To get started, we'll create a module. In this example, it's an HTTP module, `api.js`, which will simply return "Hello World" when we navigate to `localhost:3000`. We need to export a name and a factory at a minimum. Checkout [Registering Modules](https://github.com/losandes/hilaryjs/wiki/Registering-Modules) for more detailed instructions.

> Note that we're not referencing Hilary, yet. There is no need to couple Hilary to your modules.

```JavaScript
// api.js
module.exports.name = 'api';
module.exports.factory = function (http) {
    'use strict';

    http.createServer(function (req, res) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Hello World\n');
    }).listen(3000, '127.0.0.1');

    console.log('Server running at http://127.0.0.1:3000/');

    return http;
};
```

The module above depends on the `http` module. This is built in to Node.js, and we could start our app now, but let's add our own `http` module that uses `httpsys` if we're on a Windows platform.

```JavaScript
// http.js
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
```

Finally, we'll start the app. In `app.js` (filename is your preference), we'll `require` Hilary, create a scope, and compose our application, using Hilary's bootstrapper.

```JavaScript
// app.js
'use strict';

var hilary = require('../../index.js'), //require('hilary');
    http = require('./http.js'),
    api = require('./api.js');

hilary.scope('myApp', {
    log: {
        level: 'trace'
    }
}).bootstrap([
    function (scope, next) {
        console.log('registering modules');

        // note: you can also register indexes (arrays of modules)
        scope.register(http);
        scope.register(api);

        next(null, scope);
    }
], function (err, scope) {
    if (err) {
        throw err;
    }

    console.log('starting api');
    // In this example, resolving `api` starts our app
    scope.resolve('api');
});
```

We can now run our example: `node app`, and navigate to `localhost:3000` to see it working.


## Getting Started with the Browser
