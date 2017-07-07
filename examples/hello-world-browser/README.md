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
