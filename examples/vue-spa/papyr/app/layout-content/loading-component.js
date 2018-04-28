module.exports = {
  scope: 'papyr',
  name: 'loading-component',
  factory: (Vue) => {
    'use strict'

    const state = {
      copy: 'Loading...'
    }

    const component = Vue.component('loading', {
      template: `
        <div class="component loading-component">{{copy}}</div>
      `,
      data: () => state
    })

    return { component }
  }
}
