module.exports = {
  scope: 'papyr',
  name: 'home-controller',
  dependencies: ['page', 'content-vue'],
  factory: (page, content) => {
    'use strict'

    page('/', () => {
      content.component = 'home'
    })
  }
}