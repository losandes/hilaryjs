module.exports = {
  scope: 'papyr',
  name: 'home-controller',
  dependencies: ['router', 'content-vue'],
  factory: (router, content) => {
    'use strict'

    router.get('/', () => {
      content.component = 'home'
    })
  }
}