Building a SPA with Vue.js & Hilary: Composition Root
=====================================================
The [composition root](http://blog.ploeh.dk/2011/07/28/CompositionRoot/) is the entry point for our JavaScript application. It is where we will define our dependency graph, and start our app. We're going to use [hilary](https://github.com/losandes/hilaryjs) to manage our dependencies.

## Create an app directory and files

```Shell
/papyr $ mkdir app
/papyr $ cd app
/papyr/app $ touch app.js
```

## Add a boilerplate bootstrapper
All of our modules need to be defined on the same [hilary scope](https://github.com/losandes/hilaryjs/blob/master/docs/Getting-Started---With-Node.md#scopes). For this exercise, we'll name our scope, 'papyr'.

To start the app, we can use [hilary's bootstrapper](https://github.com/losandes/hilaryjs/blob/master/docs/Getting-Started---With-Node.md#bootstrapping-your-app).

> NOTE the bootstrapper's first argument is an array of functions that use callbacks to control the flow. Each function passes variables to the next function, just like a [waterfall in async.js](https://caolan.github.io/async/docs.html#waterfall).

```JavaScript
// /papyr/app/app.js
(function (hilary) {
  'use strict'

  // configure the scope for our application
  hilary.scope('papyr', {
    logging: {
      level: 'trace' // trace|debug|info|warn|error|fatal|off
    }
  // bootstrap the application
  }).bootstrap([
    (scope, next) => {
      console.log('startup::papyr::composing application')
      next(null, scope)
    }
  ], (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log('startup::papyr::application running')
    }
  })
}(hilary))
```

## Add our composition root to `index.html`, at the bottom of `body`

```HTML
<!-- /papyr/index.html -->
<!-- ... -->
<script src="/app/app.js"></script>
</body>
```