module.exports = {
  scope: 'papyr',
  name: 'startup',
  // Note the controller expression is important here and should not be removed.
  // It resolves all modules with controller in their name, and will result
  // in their routes being registered.
  dependencies: ['router', /controller/i],
  factory: function (router, controllers) {
    'use strict'

    router.listen();
  }
}