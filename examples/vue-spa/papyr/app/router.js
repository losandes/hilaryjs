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
