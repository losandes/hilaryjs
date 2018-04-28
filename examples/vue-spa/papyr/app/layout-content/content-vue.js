module.exports = {
  scope: 'papyr',
  name: 'content-vue',
  dependencies: ['Vue', /component/i],
  factory: (Vue, components) => {
    'use strict'

    return new Vue({
      el: '#content',
      data: {
        component: 'loading'
      },
      components: components.map((item) => item.component)
    })
  }
}
