// --------------
// -- Includes --
// --------------

const express = require('express')
const session = require('express-session')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const bcrypt = require('bcryptjs')
const mysql = require('mysql')

// MySQL
const database = mysql.createConnection({
  host: 'localhost',
  user: 'blokus',
  password: '',
  database: 'blokus'
})
database.connect(function (err) {
  if (err) throw err
  console.log('Connected to Blokus database')
})

// Port
const PORT = process.env.PORT || 8080

// socket.io
const http = require('http').createServer(app)
const io = require('socket.io')(http)

// bodyParser
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// set public path
app.use(express.static('public'))

// -------------
// -- Session --
// -------------

// Initialize express-session
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}))

app.get('/', function (req, res) {
  if (req.session.user === undefined) {
    res.redirect('login.html')
  } else {
    res.redirect('lobby.html')
  }
})

// -------------
// -- Sign Up --
// -------------

app.post('/signup', function (req, res) {
  const username = req.body.newUsername
  const password = req.body.newPassword
  const confirmPassword = req.body.confirmPassword
  if (username && password && confirmPassword) {
    if (confirmPassword === password) {
      bcrypt.hash(password, 10).then(function (hash) {
        database.query('INSERT INTO accounts VALUES (id, ?, ?)', [username, hash], function (error, result) {
          if (error) {
            console.log(error)
            res.redirect('/')
          } else {
            console.log('New user created')
            req.session.user = username
            res.redirect('/')
          }
        })
      })
    } else {
      console.log('Password ne correspondent pas')
      res.redirect('/')
    }
  } else {
    console.log('Champs incomplets')
    res.redirect('/')
  }
})

// -----------
// -- Login --
// -----------

// Guest
let guests = 0

app.get('/login', function (req, res) {
  req.session.user = 'guest-' + ++guests
  res.redirect('/')
})

// Login
app.post('/login', function (req, res) {
  const username = req.body.username
  const password = req.body.password
  if (username && password) {
    database.query('SELECT * FROM accounts WHERE username = ?', username, function (error, results) {
      if (error) {
        console.log(error)
        res.redirect('/')
      } else if (results.length > 0) {
        bcrypt.compare(password, results[0].password).then(function (result) {
          if (result) {
            req.session.user = username
            console.log(`Login successful : ${username}`)
            res.redirect('/')
          }
        })
      } else {
        console.log('Login incorrect')
        res.redirect('/')
      }
    })
  } else {
    console.log('Login incomplet')
    res.redirect('/')
  }
})

// Logout
app.get('/logout', function (req, res) {
  console.log(`Logout successful : ${req.session.username}`)
  req.session.destroy()
  res.redirect('/')
})

// -----------
// -- Users --
// -----------

app.get('/users', function (req, res) {
  const clients = io.clients()
  res.send(clients)
})

// -----------------
// -- Socket.io --
// -----------------

const users = {}
const rooms = []
let nRooms = 0

io.on('connection', function (socket) {
  // connection
  socket.on('new username', function (username) {
    socket.username = username
    users[username] = socket
    socket.emit('connection', username)
    console.log('a user connected')
  })

  socket.on('disconnect', function () {
    delete users[socket.username]
    socket.emit('deconnection', socket.username)
    console.log('user disconnected')
  })

  // message
  socket.on('nouveau message', function (msg) {
    socket.emit('reponse', msg) // emit : to all - sender included
    console.log('message: ' + msg)
  })

  // user 1 send match request to user 2
  socket.on('envoi defi', function (data) {
    users[data.user2].emit('nouveau defi', data)
    console.log(`defi de ${data.user1} pour ${data.user2}`)
  })

  // user 2 refuse defi
  socket.on('refus defi', function (data) {
    users[data.user1].emit('defi refuse', data)
  })

  // user 2 accepte defi, new game start
  socket.on('accepte defi', function (data) {
    // users 1 and 2 join room
    const room = 'room-' + ++nRooms
    rooms.push(room)
    users[data.user1].join(room)
    users[data.user2].join(room)
    io.in(data.room).emit('new game', data)
  })

  // play turn in a room
  socket.on('play turn', function (data) {
    io.in(data.room).emit('turn played', {
      tile: data.tile,
      room: data.room
    })
  })
})

// -----------------
// -- HTTP errors --
// -----------------

// handle 404
app.use(function (req, res, next) {
  res.status(404).sendFile(path.join(__dirname, '/error-404.html'))
})

// handle 500
app.use(function (err, req, res, next) {
  console.log(err)
  res.status(500).sendFile(path.join(__dirname, '/error-500.html'))
})

// ------------------
// -- Start server --
// ------------------

http.listen(PORT, function () {
  console.log(`\nServer started, listening on PORT ${PORT}`)
})
