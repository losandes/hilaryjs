hilary.js
=========

Hilary is an easy to use JavaScript Inversion of Control (IoC) container written for [Node.js](https://github.com/losandes/hilaryjs/blob/master/README.md#creating-your-first-node-app-with-hilary) and the [browser](https://github.com/losandes/hilaryjs/blob/master/README.md#creating-your-first-browser-app-with-hilary).  Hilary's aim is to deliver low-ceremony dependency injection (DI), to aid in decoupling JavaScript modules and testing.  It's named after Hilary Page, who designed building blocks that later became known as Legos.

Also check out [generator-hilary](https://github.com/losandes/generator-hilary), our Yeoman generator, and [Gidget](https://github.com/Acatar/gidget) our route/app engine.

> You can find documentation and examples on the [documentation](https://github.com/losandes/hilaryjs/tree/master/docs). Below is just a quick-start. There are also lots of [examples](https://github.com/losandes/hilaryjs/tree/master/examples)

> If the bootstrapper in the examples that follow looks foreign to you, consider reading about the [composition root pattern](http://blog.ploeh.dk/2011/07/28/CompositionRoot/).

## Getting Started with Node.js
Install Hilary:

```
npm install --save hilary
```


In this example, we'll produce the following files:

* **api.js**: our web server
* **http.js**: a platform specific HTTP implementation
* **app.js**: our composition root / bootstrapper

Let's start with the web server, `api.js`, which will simply return "Hello World" when we navigate to `localhost:3000`.

> Modules need to export a `name` and a `factory` at a minimum. Checkout [Registering Modules](docs/Getting-Started---With-Node.md#registering-modules) for more detailed instructions.

> Note that we're not referencing Hilary, yet. There is no need to couple Hilary to your modules. Hilary just expects your modules to export specific properties, such as name, dependencies, and factory.

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
var scope = require('hilary').scope('myApp');

scope.bootstrap([
    scope.makeRegistrationTask(require('./http.js')),
    scope.makeRegistrationTask(require('./api.js'))
], function (err, scope) {
    if (err) {
        console.log(err);
        return;
    }

    console.log('starting api');
    // In this example, resolving `api` starts our app
    scope.resolve('api');
});
```

We can now run our example: `node app`, and navigate to `localhost:3000` to see it working.


## Getting Started with the Browser
Let's say we're building a simple Hello World bot, that asks for your name, and says hello to you. We also want to be able to choose between two notifiers: alerts, and console logs.

In this example, we'll produce the following files:

* **alertNotifier.js**: notifies the user with JavaScript alerts
* **consoleNotifier.js**: notifies the user with console logs
* **bot.js**: says hello
* **viewModel.js**: binds to the DOM
* **app.js**: our composition root / bootstrapper
* **index.html**: the markup

We'll start with the alert notifier:

> Modules need to export a `name` and a `factory` at a minimum. Checkout Checkout [Registering Modules](docs/Getting-Started---With-the-Browser.md#registering-modules) for more detailed instructions. When using a shim, like `module.exports`, the `scope` is also required.

```JavaScript
// alertNotifier.js
module.exports = {
    scope: 'myApp',
    name: 'alertNotifier',
    factory: function () {
        'use strict';

        return {
            notify: function (message) {
                alert(message);
            }
        };
    }
};
```

Then, we'll add a console notifier:
```JavaScript
// consoleNotifier.js
module.exports = {
    scope: 'myApp',
    name: 'consoleNotifier',
    factory: function () {
        'use strict';

        return {
            notify: function (message) {
                console.log(message);
            }
        };
    }
};
```

Next, we'll add a bot module that depends on `notifier`, to say hello:

> Note that the interface of notifier matches both the alertNotifier, and the consoleNotifier, but neither have the name, "notifier". We'll register the module we want to use later.

```JavaScript
// bot.js
module.exports = {
    scope: 'myApp',
    name: 'bot',
    dependencies: ['notifier'],
    factory: function (notifier) {
        'use strict';

        return {
            sayHello: function (name) {
                notifier.notify('Hello, ' + name);
            }
        };
    }
};
```

Since this is a web app, we need to bind to the DOM. Let's create a view model that binds to a text input, and a button:

```JavaScript
// viewModel.js
module.exports = {
    scope: 'myApp',
    name: 'viewModel',
    dependencies: ['bot'],
    factory: function (bot) {
        'use strict';

        document.getElementById('submit').addEventListener('click', function() {
            bot.sayHello(document.getElementById('name').value);
        }, false);
    }
};
```

Finally, we'll compose/bootstrap these modules. We need to register the chosen `notifier`, and resolve `viewModel` to bind to the DOM, starting the app:

```JavaScript
// app.js
hilary.scope('myApp').bootstrap([
    function (scope, next) {
        scope.register({
            name: 'notifier',
            factory: scope.resolve('alertNotifier')
        });

        next(null, scope);
    }
], function (err, scope) {
    if (err) {
        throw err;
    }

    scope.resolve('viewModel');
    console.log('ready');
});
```

And here's the markup:

```HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>hilary | Hello World</title>
</head>
<body>
    <label>What is your name?</label>
    <input id="name" type="text" />
    <input id="submit" type="submit" value="submit" />

    <script src="bower_components/polyn/release/polyn.min.js"></script>
    <script src="bower_components/hilary/release/hilary.min.js"></script>
    <script src="bower_components/hilary/release/hilary-browser-module-shim.js"></script>
    <script src="alertNotifier.js"></script>
    <script src="consoleNotifier.js"></script>
    <script src="bot.js"></script>
    <script src="viewModel.js"></script>
    <script src="app.js"></script>

</body>
</html>
```

### What if I already have another `module.exports` shim?
These examples use a module.exports shim, which isn't required. If you are using another module.exports implementation, you can replace this:

```JavaScript
module.exports = {
    scope: 'myApp',
    name: 'myModule',
    factory: function () {}
}
```

with this:
```JavaScript
Hilary.scope('myApp').register({
    scope: 'myApp',
    name: 'myModule',
    factory: function () {}
});
```

You also could write your own shim, if you don't want to couple your modules to hilary (recommended):

```JavaScript
window.customRegister = function (val) {
    if (!val) {
        return;
    }

    if (val.scope) {
        hilary.scope(val.scope).register(val);
    } else {
        console.log(new Error('WARNING: you should always declare a scope when registering hilary modules in a browser (module: ' + val.name + ')'));
        hilary.register(val);
    }
}
```
