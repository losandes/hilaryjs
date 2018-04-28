const fs = require('fs')
const express = require('express')
const serveStatic = require('serve-static')

var app = express()

// serve this directory as a static web server
app.use(serveStatic(__dirname))

// 404 - return the SPA index for any files that aren't found
app.use(function (req, res, next) {
  'use strict'

  res.writeHead(200, { 'Content-Type': 'text/html' })
  fs.createReadStream('./index.html').pipe(res)
})

// response to port 3001
app.listen(3001)
console.log('The app is running at http://localhost:3001')