module.exports = {
  scope: 'papyr',
  name: 'content-vue',
  dependencies: ['Vue', /component/i],
  factory: (Vue, components) => {
    'use strict'

    const app = new Vue({
      el: '#content',
      data: {
        component: 'loading'
      },
      components: components.filter((item) => {
        return item && typeof item.component === 'object'
      }).reduce((output, item) => {
        output[item.name] = item.component
        return output
      }, {})
    })

    const self = {}

    /**
     * Allows you to set the current component using syntax like:
     * `content.component = 'products'`
     */
    Object.defineProperty(self, 'component', {
      get: () => {
        return app.component
      },
      set: (name) => {
        scroll(0, 0)
        app.component = 'loading' // forces the component to reload unless the current component is loading
        app.component = name
      },
      enumerable: true,
      configurable: false
    })

    return Object.freeze(self)
  }
}
