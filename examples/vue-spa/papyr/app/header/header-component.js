module.exports = {
  scope: 'papyr',
  name: 'header-component',
  dependencies: ['Vue', 'page', 'query-string'],
  factory: (Vue, page, qs) => {
    'use strict'

    const state = {
      brand: 'Papyr',
      query: qs.getCurrent().q || ''
    }

    const search = () => {
      page(`/products?q=${encodeURIComponent(state.query)}`)
    }

    const component = Vue.component('main-header', {
      template: `
        <div class="component header-component">
          <div id="brand">
            <a href="/">{{brand}}</a>
          </div>
          <div id="search">
            <input type="text" placeholder="search" v-model="query" v-on:keyup.enter="search">
          </div>
        </div>
      `,
      data: () => state,
      methods: { search }
    })

    return Object.freeze({ name: 'main-header', component })
  }
}