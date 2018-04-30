module.exports = {
  scope: 'papyr',
  name: 'Book',
  dependencies: ['polyn { Immutable }'],
  factory: (Immutable) => {
    'use strict'

    const IBook = new Immutable({
      __blueprintId: 'Book',
      uid: 'string',
      title: 'string',
      description: 'string',
      price: 'money',
      priceText: 'string',
      thumbnailLink: 'string',
      thumbnailAlt: 'string',
      type: 'string',
      authors: 'array'
    })

    return function Book (product) {
      product = Object.assign({}, product)
      product.priceText = `$${product.price}`
      product.thumbnailAlt = product.thumbnailAlt || `the book cover of ${product.title}`
      product.authors = product.metadata.authors

      return new IBook(product)
    }
  }
}