// --------------
// -- includes --
// --------------

const express = require('express')
const app = express()
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const io = require('socket.io')()

// cookieParser
app.use(cookieParser())

// bodyParser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// set public path
app.use(express.static('public'))

// login page default
app.get('/', function (req, res) {
  res.redirect('login.html')
})

// -----------
// -- Login --
// -----------

app.get('/login', function (req, res) {
  console.log(1)
})

app.post('/login', function (req, res) {
  console.log(JSON.stringify(req.body))
  const username = req.body.username
  const password = req.body.password
  if (username === 'user' && password === 'pass') {
    res.redirect('lobby.html')
  } else {
    res.redirect('/')
  }
})

// -----------
// -- Users --
// -----------

app.get('/users', function (req, res) {
  const clients = io.clients()
  res.send(clients)
})

// -----------------
// -- HTTP errors --
// -----------------

// handle 404
app.use(function (err, req, res, next) {
  console.log(err)
  res.status(404).sendFile('error-404.html')
})

// handle 500
app.use(function (err, req, res, next) {
  console.log(err)
  res.status(500).sendFile('error-500.html')
})

// ------------------
// -- Start server --
// ------------------

app.listen(3000, function () {
  console.log('\nServer started, listening on PORT 3000')
})
