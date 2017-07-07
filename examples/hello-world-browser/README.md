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
