module.exports = {
  scope: 'papyr',
  name: 'products-controller',
  dependencies: ['page', 'query-string', 'content-vue', 'products-component', 'products-repository'],
  factory: (page, queryString, content, productsComponent, productsRepo) => {
    'use strict'

    const registerRoutes = () => {
      page('/products', (context) => {
        const qs = queryString.parse(context.querystring);
        productsRepo.find(qs.q)
          .then((products) => {
            productsComponent.setProducts(products);
            content.component = 'products'
          })
      })
    }

    return Object.freeze({ registerRoutes })
  }
}
