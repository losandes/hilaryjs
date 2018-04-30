module.exports = {
  scope: 'papyr',
  name: 'Product',
  dependencies: ['polyn { Immutable }'],
  factory: (Immutable) => {
    'use strict'

    const IProduct = new Immutable({
      __blueprintId: 'Product',
      uid: 'string',
      title: 'string',
      description: 'string',
      price: 'money',
      priceText: 'string',
      thumbnailLink: 'string',
      thumbnailAlt: 'string',
      type: 'string',
      metadata: 'object'
    })

    return function Product (product) {
      product = Object.assign({}, product)
      product.priceText = `$${product.price}`
      product.thumbnailAlt = product.thumbnailAlt || `the picture for the ${product.type}`

      return new IProduct(product)
    }
  }
}