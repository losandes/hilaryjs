Building a SOLID Vue.js App: Router
===================================
Our app will use URL routes as the triggers that cause the user experience to change, and update. We're going to use [page.js](https://visionmedia.github.io/page.js/) for the routing.

## Add router, and startup files

```Shell
/papyr/app $ touch router.js
/papyr/app $ touch startup.js
```

## Add a router module
We could use page.js on it's own, but we're going to wrap it to remove some boilerplate. In addition to dealing with boilerplate, our router starts listening to the document events, and sets up a 404 route.

```JavaScript
// /papyr/app/router.js
module.exports = {
  scope: 'papyr',
  name: 'router',
  dependencies: ['page', 'content-vue'],
  factory: function (page, content) {
    'use strict'

    /**
     * This is a very rudimentary query string parser. It is NOT standards
     * compliant and isn't suitable for distribution. In other words, it's
     * not worth borrowing.
     * @param {string} queryString - the part of the URL following the question mark, if anything
     */
    const makeQueryObject = (queryString) => {
      if (!queryString) {
        return {}
      }

      return queryString.split('&')
        .reduce((output, pair) => {
          const keyvalue = pair.split('=')
          output[keyvalue[0]] = keyvalue[1]

          return output
        }, {})
    }

    function Context (context) {
      return Object.freeze({
        canonicalPath: context.canonicalPath,
        query: makeQueryObject(context.querystring),
        hash: context.hash,
        path: context.path,
        pathName: context.pathname,
        params: context.params,
        title: context.title,
        state: context.state
      })
    }

    const get = (path, handler) => page(path, (context, next) => {
      scroll(0, 0)                  // scroll to the top of the page
      content.component = 'loading' // switch to the loading screen, to force
                                    // the component to update, if only the
                                    // query string changes
      return handler(new Context(context))
        .then(() => next())
        .catch(next)
    })

    const navigate = (path) => {
      return page(path)
    }

    const listen = () => {
      // Add a catch-all (404)
      page('*', function (context) {
        console.log(`404`, context)
        content.component = 'home'
      })

      // start listening
      page()
    }

    return Object.freeze({ get, navigate, listen })
  }
}
```

## Add a startup module
This module will bind the router to the document events to start our app.

```JavaScript
// /papyr/app/startup.js
module.exports = {
  scope: 'papyr',
  name: 'startup',
  // Note the controller expression is important here and should not be removed.
  // It resolves all modules with controller in their name, and will result
  // in their routes being registered.
  dependencies: ['router', /controller/i],
  factory: function (router, controllers) {
    'use strict'

    router.listen();
  }
}
```

## Add our file to `index.html`
The scripts need to be loaded **before** `app.js` is loaded.

```HTML
<!-- /papyr/index.html -->
<!-- ... -->
<script src="/app/router.js"></script>
<script src="/app/startup.js"></script>
<script src="/app/app.js"></script>
<!-- ... -->
```

## Compose the router
Finally, we need to compose the router to start listening to document events. We've done all the hard work. We just need to resolve `startup` in our bootstrapper. Replace the `resolve('content-vue')` function with one that resolves, "startup" in the `bootstrap` function in `app.js`.

```JavaScript
// /papyr/app/app.js
// ...
(scope, next) => {
  console.log('startup::papyr::composing application')
  scope.resolve('startup')
  next(null, scope)
}
// ...
```

Now if your app is running (`npm start`), and you refresh the page at http://localhost:3001, the page should be blank, and you should see a 404 in the developer console. That's because we haven't registered a handler for the home page yet. We'll do that next.

