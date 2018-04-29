module.exports = {
  scope: 'papyr',
  name: 'router',
  dependencies: ['page', 'content-vue'],
  factory: function (page, content) {
    'use strict'

    const listen = () => {
      // Add a catch-all (404)
      page('*', (context) => {
        console.log(`404`, context)
        content.component = 'home'
      })

      // start listening
      page()
    }

    return Object.freeze({ listen })
  }
}
