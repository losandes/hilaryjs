module.exports = {
  scope: 'papyr',
  name: 'header-vue',
  dependencies: ['Vue', 'header-component'],
  factory: (Vue, headerComponent) => {
    'use strict'

    return new Vue({
      el: '#header',
      data: {
        component: 'main-header'
      },
      components: {
        'main-header': headerComponent.component
      }
    })
  }
}
