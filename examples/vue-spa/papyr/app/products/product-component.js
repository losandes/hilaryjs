module.exports = {
  scope: 'papyr',
  name: 'product-component',
  dependencies: ['Vue'],
  factory: (Vue) => {
    'use strict'

    const viewDetails = (product) => {
      page(`/books/${product.uid}`)
    }

    const addToCart = (product) => { console.log('TODO', product) }

    const component = Vue.component('product', {
    template: `
      <div class="col-sm-6 col-md-4 product-col">
        <div class="thumbnail">
          <a class="thumbnail-img" href="javascript:void(0);" v-on:click="viewDetails(product)">
            <img v-bind:src="product.thumbnailLink" v-bind:alt="product.thumbnailAlt">
          </a>

          <div class="caption">
            <h3><a href="javascript:void(0);" v-on:click="viewDetails(product)">{{product.title}}</a></h3>
            <div class="description">{{product.description}}</div>
            <div class="overlay"></div>
            <button v-on:click="addToCart(product)">{{product.priceText}}</button>
          </div>
        </div>
      </div>
    `,
    props: ['product'],
    methods: { viewDetails, addToCart }
    })

    return Object.freeze({ name: 'product', component })
  }
}