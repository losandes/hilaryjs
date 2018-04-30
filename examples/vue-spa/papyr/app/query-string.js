module.exports = {
  scope: 'papyr',
  name: 'query-string',
  dependencies: [],
  factory: function () {
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
          output[keyvalue[0]] = decodeURIComponent(keyvalue[1])

          return output
        }, {})
    }

    const getCurrent = () => {
      const current = location.href.split('?');
      return parse(current.length > 1 ? current[1] : '')
    }

    return Object.freeze({ parse, getCurrent })
  }
}
