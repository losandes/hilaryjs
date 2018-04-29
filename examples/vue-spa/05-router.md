Building a SPA with Vue.js & Hilary: Router
===========================================
Our app will use URL routes as the triggers that cause the user experience to change, and update. We're going to use [page.js](https://visionmedia.github.io/page.js/) for the routing.

## Add router, and startup files

```Shell
/papyr/app $ touch query-string.js
/papyr/app $ touch router.js
/papyr/app $ touch startup.js
```

## Add a query-string module
Page.js gives us the querystring as a string, and we'll need to parse the values from it. Here's a simple (maybe too simple) query string parser.

```JavaScript
// /papyr/app/query-string.js
module.exports = {
  scope: 'papyr',
  name: 'query-string',
  dependencies: ['page', 'content-vue'],
  factory: function (page, content) {
    'use strict'

    /**
     * This is a rudimentary query string parser. It is NOT standards
     * compliant and isn't suitable for distribution: it doesn't support
     * duplicates.
     * @param {string} queryString - the part of the URL following the question mark, if anything
     */
    const parse = (queryString) => {
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

    return { parse }
  }
}
```

## Add a router module
We could use page.js on it's own, but there are some complexities in using it with vue.js that we can solve once, and then forget about it: when changing components, we need to scroll to the top, and when only the query string changes, we need to make sure the component for that page reloads with new state.

In addition to dealing with those boilerplate needs, the router exposes a `listen` function that will handle 404s and start listening to the document events.

```JavaScript
// /papyr/app/router.js
module.exports = {
  scope: 'papyr',
  name: 'router',
  dependencies: ['page', 'query-string', 'content-vue'],
  factory: function (page, qs, content) {
    'use strict'

    function Context (context) {
      return Object.freeze({
        canonicalPath: context.canonicalPath,
        query: qs.parse(context.querystring),
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
      content.component = 'loading' // switch to the loading screen to force
                                    // the component to update if only the
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
      page('*', (context) => {
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
This module implicitly enumerates the controllers to register their routes by depending on a naming convention: `/controller/i`: all modules with the word controller will execute, having an opportunity to register their routes. Finally we bind the router to the document events to start our app with `listen`.

```JavaScript
// /papyr/app/startup.js
module.exports = {
  scope: 'papyr',
  name: 'startup',
  // NOTE: depending on `/controller/i` will execute the factory of every
  // module that has the word "controller" in it's name. This implicity
  // registers any routes they define.
  dependencies: ['router', /controller/i],
  factory: function (router, controllers) {
    'use strict'

    router.listen();
  }
}
```

## Add our files to `index.html`
The scripts need to be loaded **before** `app.js` is loaded.

```HTML
<!-- /papyr/index.html -->
<!-- ... -->
<script src="/app/query-string.js"></script>
<script src="/app/router.js"></script>
<script src="/app/startup.js"></script>

<script src="/app/app.js"></script>
<!-- ... -->
```

## Compose the router
Finally, we need to compose the router to start listening to document events. We've done all the hard work. We just need to resolve `startup` in our bootstrapper. Replace the `resolve('content-vue')` function with one that resolves, "startup" in the `bootstrap` function in `app.js`.

> The reason we no longer need to resolve content-vue is because our controllers depend on it. So, by resolving startup, we also implicitly resolve content-vue. You can still resolve content-vue here. It won't hurt anything. It just isn't necessary.

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

