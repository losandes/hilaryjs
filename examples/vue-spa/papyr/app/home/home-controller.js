module.exports = {
  scope: 'papyr',
  name: 'home-controller',
  dependencies: ['page', 'content-vue'],
  factory: (page, content) => {
    'use strict'

    const registerRoutes = () => {
      page('/', () => {
        content.component = 'home'
      })
    }

    return Object.freeze({ registerRoutes })
  }
}