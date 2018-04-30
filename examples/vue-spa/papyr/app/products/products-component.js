module.exports = {
  scope: 'papyr',
  name: 'products-component',
  dependencies: ['Vue'],
  factory: (Vue) => {
    'use strict'

    const state = {
      products: []
    }

    const component = Vue.component('products', {
      template: `
      <div class="component products-component">
        <product v-for="product in products"
          v-bind:key="product.uid" v-bind:product="product">
        </product>
      </div>
    `,
      data: () => state
    })

    const setProducts = (products) => {
      state.products = products
    }

    const addProducts = (products) => {
      // it's usually better to overwrite the array than to n+1 modify it
      // to reduce DOM trashing
      state.products = state.products.concat(products)
    }

    return Object.freeze({ name: 'products', component, setProducts, addProducts })
  }
}
