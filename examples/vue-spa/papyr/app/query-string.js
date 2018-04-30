module.exports = {
  scope: 'papyr',
  name: 'query-string',
  dependencies: ['page', 'content-vue'],
  factory: function (page, content) {
    'use strict'

    /**
     * This is a rudimentary query string parser. It is NOT standards
     * compliant and isn't suitable for distribution: it doesn't support
     * duplicates.
     * @param {string} queryString - the part of the URL following the question mark, if anything
     */
    const parse = (queryString) => {
      if (!queryString) {
        return {}
      }

      return queryString.split('&')
        .reduce((output, pair) => {
          const keyvalue = pair.split('=')
          output[keyvalue[0]] = keyvalue[1]

          return output
        }, {})
    }

    return Object.freeze({ parse })
  }
}
