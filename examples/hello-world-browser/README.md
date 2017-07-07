This example is a hello world web app that has a bot that can say hello.

First install the dependencies. Navigate to this directory in a terminal and:
```
bower install
```

Then start the app using an HTTP server. I usually use a node.js package for this:
```
npm install -g http-server
```

And to start it:
```
http-server
```

In a browser, navigate to the port it's running on (i.e. localhost:8080). Type in your name and submit. You should see an alert.

Now, in app.js, change `alertNotifier` to `consoleNotifier`. Refresh the page, and open the developer console. When you submit your name, you should see the message printed to the console, instead of an alert now.

## So, what's happening here?
Let's start with the notifiers. In this example, we want to be able to choose between two notifiers: alerts, and console logs. To make this possible, we'll register two modules that implement the same interface. Take a look at [alertNotifier](alertNotifier.js), and [consoleNotifier](consoleNotifier.js). They both implement a `notifier` interface:

```JavaScript
{
    notify: message => {
        // ...
    }
}
```

The [bot](bot.js) module depends on `notifier`, which is NOT another module. We expect this to be satisfied by a module that implements the `notifier` interface. Both `consoleNotifier`, and `consoleNotifier` are acceptable, in this example.

The [viewModel](viewModel.js) binds to the DOM, and needs to be executed on startup for things to work. It depends on `bot`, which it will use to notify the user when they click submit.

These are composed by [app](app.js). The bootstrapper in `app` registers the chosen `notifier`, and starts the application by resolving `viewModel`, in the callback.

## What if I already have another `module.exports` shim?
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
(function (window, hilary) {
    'use strict';

    if (!window) {
        return;
    }

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
}(
    typeof window !== 'undefined' ? window : null,
    typeof window !== 'undefined' ? window.hilary : null
));
```
