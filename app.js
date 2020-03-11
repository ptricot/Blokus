const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')

const port = 3000

// cookieParser
app.use(cookieParser())

// set public path
app.use(express.static('public'))

// -----------------
// -- HTTP errors --
// -----------------

// handle 404
app.use(function (err, req, res, next) {
  console.log(err)
  res.status(404).sendFile('/html/error-404.html')
})

// handle 500
app.use(function (err, req, res, next) {
  console.log(err)
  res.status(500).sendFile('/html/error-500.html')
})

app.listen(port, function () {
  console.log('Server started')
})
